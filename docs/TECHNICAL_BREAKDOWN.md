# POS System Technical Breakdown

## 1. System Architecture

### 1.1 Overall architecture (3-tier)
- **Presentation tier (Frontend)**: React + Vite SPA in `pos_frontend` handles user interaction, route protection, form flows, and API invocation through Axios wrappers.
- **Application tier (Backend)**: Spring Boot REST API in `pos_backend` handles authentication, role checks, business rules (stock, pricing, validation), and response shaping via DTOs.
- **Data tier (Database)**: PostgreSQL (via Docker compose) persists users, categories, products, sales, and sale items.

### 1.2 Communication flow
1. User authenticates through frontend login form.
2. Frontend sends credentials to backend `/api/auth/login`.
3. Backend validates user/password (BCrypt), issues JWT.
4. Frontend stores JWT in `localStorage`; Axios interceptor automatically sends `Authorization: Bearer <token>`.
5. Spring Security JWT filter validates token and injects authentication into security context.
6. Controller receives authenticated principal and invokes service-layer operations.
7. Services use JPA repositories to read/update PostgreSQL data.
8. Backend returns JSON payloads (entities or DTOs); frontend updates UI state.

### 1.3 REST API design characteristics
- Resource-based URLs (`/api/categories`, `/api/products`, `/api/sales`).
- HTTP-method semantics:
  - `GET` for read.
  - `POST` for create/actions (sale creation).
  - `PUT` for update.
  - `DELETE` for delete.
- Layered request lifecycle: controller → service → repository.
- Structured error mapping through `ResponseStatusException` + global exception advice payload.
- Partial DTO usage (strong in sales/report, mixed entity exposure in users/products/categories).

### 1.4 Stateless vs stateful design decisions
- Security is **stateless**:
  - `SessionCreationPolicy.STATELESS`.
  - JWT carries identity claims; no HTTP session used.
- UI state is stateful in browser memory/`localStorage` (cart, login state, tables, edit modes).
- No server-side conversational state for checkout cart; cart exists frontend-side until sale submission.

### 1.5 Separation of concerns
- **Frontend**: UI rendering + client-side routing + API composition.
- **Backend controllers**: endpoint mapping + auth principal capture.
- **Services**: business rules (uniqueness, stock deduction, validation, invoice creation).
- **Repositories**: persistence abstraction through JPA.
- **DTO package**: response/request shaping for sales/receipt/report, reducing overexposure and recursive graphs.

---

## 2. Backend (Spring Boot)

### 2.1 Technologies in use
- Spring Boot application bootstrap.
- Spring Security with custom JWT filter.
- JJWT (`jjwt-api`, `jjwt-impl`, `jjwt-jackson`) for token generation/parsing.
- Spring Data JPA/Hibernate repositories/entities.
- PostgreSQL runtime driver.
- Maven build + wrapper + multi-stage Docker build.
- Lombok for entity/DTO boilerplate reduction.

### 2.2 Package structure
- `auth`: login endpoint and auth service.
- `config`: security chain, JWT provider, JWT auth filter.
- `user`: user entity, role enum, repository, CRUD service/controller.
- `category`: category entity/repository/service/controller + dropdown DTO.
- `product`: product entity/repository/service/controller/request DTO + `UnitType` enum.
- `sale`: sale aggregate (`Sale`, `SaleItem`), request DTOs, response DTOs, service/controller.
- `report`: report controller/service + analytics DTOs.
- `common`: global exception handler.

### 2.3 Layer usage
- **Controllers**: map REST endpoints and delegate; minimal logic.
- **Services**: validation + transformations + persistence orchestration.
- **Repositories**: Spring Data interfaces with derived query methods (`existsByNameIgnoreCase`, `existsByCategoryId`, etc.).

### 2.4 DTO usage and request/response separation
- DTO-heavy flows:
  - Product create/update use `ProductRequest` (prevents direct entity mutation from raw JSON).
  - Sales creation uses `CreateSaleRequest` and `CreateSaleItemRequest`.
  - Sales read returns `SaleResponseDTO` + `SaleItemResponseDTO`.
  - Receipts return `ReceiptResponseDTO`, `ReceiptItemDTO`, `ShopDTO`.
  - Report endpoints return specialized analytics DTOs.
- Entity-direct exposure still exists for users/categories/products in some endpoints (trade-off: faster development vs tighter API contracts).

### 2.5 Entity model details

#### User
- Fields:
  - `id` (Long, identity PK).
  - `username` (unique + not null).
  - `password` (not null; BCrypt-hashed before persist/update).
  - `role` (`ADMIN` / `CASHIER`, enum string).
- Role drives access control in security checks and frontend route branching.

#### Category
- Fields:
  - `id` identity PK.
  - `name` unique + not null.
- Product references category (`ManyToOne` from Product side).
- Service trims name and enforces case-insensitive uniqueness.

#### Product
- Fields:
  - `id` identity PK.
  - `name` (service-level uniqueness with case-insensitive checks).
  - `price` (`BigDecimal`, not null).
  - `stock` (`BigDecimal`, nullable at DB level but treated as required by business/UI).
  - `category` (`ManyToOne` with `@JoinColumn(category_id)`).
  - `unitType` enum (`UNIT` or `KG`, not null).
- Design highlights:
  - `BigDecimal` used to support weighted products and avoid floating precision loss.
  - `UnitType` influences UI steps and backend validation (e.g., KG decimal precision check on update).

#### Sale
- Fields:
  - `id` identity PK.
  - `invoiceNumber` unique + not null (`INV-XXXXXXXX`).
  - `totalAmount` (`BigDecimal`).
  - `timestamp` (`LocalDateTime`).
  - `cashier` (`ManyToOne` to User).
  - `items` (`OneToMany(mappedBy="sale", cascade=ALL)` to SaleItem).
- Acts as transaction header.

#### SaleItem
- Fields:
  - `id` identity PK.
  - `product` (`ManyToOne` to Product).
  - `quantity` (`BigDecimal`).
  - `priceAtSale` (`BigDecimal`) stores line total snapshot.
  - `sale` (`ManyToOne` back-reference).
- Represents transaction lines and captures sale-time monetary value.

---

## 3. Business Logic

### 3.1 Product logic
- **Case-insensitive uniqueness**:
  - On create: reject if `existsByNameIgnoreCase` is true.
  - On update: allow unchanged same-name update, block rename collisions.
- **UnitType behavior**:
  - `UNIT`: integer-like operational semantics in UI (`step=1`), quantity defaults 1.
  - `KG`: decimal quantities, UI defaults to `0.5`, backend enforces max 2 decimal places on update path.
- **Stock as BigDecimal**:
  - Supports both piece-count and weight quantities under one field type.
  - Enables `compareTo`, `subtract`, and accurate currency/quantity multiplication in sale processing.

### 3.2 Category logic
- Category deletion is protected by service-level pre-check:
  - If category absent → 404.
  - If any products reference the category (`existsByCategoryId`) → 400 with explicit message.
- This avoids orphan references and mirrors FK integrity expectations.

### 3.3 Sales logic

#### Sale creation flow
1. Resolve cashier by authenticated username.
2. Iterate request items.
3. Validate quantity > 0.
4. Fetch product by ID.
5. Check stock sufficiency (`stock.compareTo(quantity) < 0` → reject).
6. Deduct product stock and persist product.
7. Compute line total (`price * quantity`).
8. Accumulate order total.
9. Build sale items and associate with sale.
10. Create sale with invoice number + timestamp + total.
11. Persist sale (cascade persists items).
12. Return mapped DTO.

#### Validation logic
- Null/zero/negative quantity blocked.
- Missing product blocked.
- Missing cashier blocked.
- Insufficient stock blocked.
- Fail-fast with `ResponseStatusException` and descriptive messages.

#### Invoice generation
- Format: `INV-` + uppercase first 8 chars of random UUID.
- Unique DB constraint on `invoiceNumber` provides collision safety net.

#### Price snapshot logic
- `SaleItem.priceAtSale` stores line total at transaction time.
- Response/receipt `unitPrice` currently reads from current `Product.price`; historical per-unit price is **not fully snapshotted**, so later product price changes can affect displayed unit price in historical receipts while line total remains preserved.

### 3.4 Receipt generation
- Source: persisted sale + items + injected `shop.*` configuration values.
- Included data:
  - Invoice number.
  - Shop name/address/phone.
  - Sale date-time.
  - Cashier username.
  - Item lines (name, qty, unitPrice, total).
  - Total amount.
  - Footer text.
- Receipt returned as structured DTO for frontend rendering/printing.

---

## 4. Security

### 4.1 JWT authentication flow
1. Client posts username/password to login endpoint.
2. Auth service finds user and validates password via BCrypt matcher.
3. JWT created with subject=username and claim `role`.
4. Frontend decodes token and stores it.
5. Axios interceptor appends bearer token on every request.
6. Backend JWT filter validates token signature/expiry, resolves user from DB, and sets authentication authority using stored role.

### 4.2 Token structure
- Standard claims:
  - `sub` = username.
  - `iat`, `exp`.
- Custom claim:
  - `role` (`ADMIN` or `CASHIER`).

### 4.3 Role handling (ADMIN vs CASHIER)
- Backend HTTP method/route restrictions in `SecurityFilterChain`:
  - Category and product writes: ADMIN only.
  - Sales creation: ADMIN or CASHIER.
  - `/sales/my-sales`: CASHIER.
  - `/sales/get-all`: ADMIN.
- Frontend route guards require exact role string match.
- Sidebar/menu options are role-conditioned.

### 4.4 Spring Security configuration notes
- CORS enabled with allowed origins from property.
- CSRF disabled for API/JWT model.
- Stateless session policy.
- JWT filter inserted before username/password auth filter.
- Catch-all `anyRequest().authenticated()` ensures all non-whitelisted endpoints need auth.

### 4.5 CORS handling
- Global CORS bean parses comma-separated origins from env/property.
- Allows methods `GET, POST, PUT, DELETE, OPTIONS`, all headers, credentials true.
- Explicit permit for preflight `OPTIONS /**`.

### 4.6 Potential security pitfalls observed
- `ReportController` uses `@PreAuthorize("hasRole('ADMIN')")`; authorities are set as `ADMIN` (without `ROLE_` prefix). Without method-security config and/or authority alignment, this can cause role mismatch behavior.
- `UserController` endpoints are authenticated but not explicitly ADMIN-restricted in HTTP matcher list.

---

## 5. API Design (endpoint inventory)

### 5.1 Auth
- `POST /api/auth/login`
  - Purpose: issue JWT.
  - Access: public.
  - Request: `{ username, password }`.
  - Response: `{ token }`.

### 5.2 Users
- `POST /api/users` create user.
- `GET /api/users` list users.
- `GET /api/users/{id}` fetch user.
- `PUT /api/users/{id}` update user.
- `DELETE /api/users/{id}` delete user.
- Access: authenticated (no explicit role lock in `SecurityConfig`).
- Payload: entity-shaped `User` JSON.

### 5.3 Categories
- `POST /api/categories` create category (ADMIN).
- `GET /api/categories` list categories (DTO for dropdown).
- `PUT /api/categories/{id}` update category (ADMIN).
- `DELETE /api/categories/{id}` delete category (ADMIN with product-existence guard).

### 5.4 Products
- `POST /api/products` create product (ADMIN; `ProductRequest`).
- `GET /api/products` list products (authenticated).
- `PUT /api/products/{id}` update product (ADMIN; `ProductRequest`).
- `DELETE /api/products/{id}` delete product (ADMIN).

### 5.5 Sales
- `POST /api/sales` create sale (ADMIN/CASHIER; `CreateSaleRequest`).
- `GET /api/sales/get-all` all sales (ADMIN).
- `GET /api/sales/my-sales` current cashier sales (CASHIER).
- `GET /api/sales/{id}` sale detail (authenticated).
- `GET /api/sales/{id}/receipt` receipt DTO (authenticated by fallback rule; intended cashier/admin use).

### 5.6 Reports
- `GET /api/reports/sales-summary?from&to`
- `GET /api/reports/daily-revenue`
- `GET /api/reports/top-products?limit=5`
- `GET /api/reports/low-stock?threshold=10`
- Intended access: ADMIN only via `@PreAuthorize`.

### 5.7 Error response shape
- For `ResponseStatusException`, response body format:
  - `timestamp`
  - `status`
  - `error`
- Generic exceptions mapped to 500 + "Internal Server Error".

---

## 6. Frontend (React)

### 6.1 Technologies
- React functional components + hooks.
- React Router for SPA routing.
- Context API for authentication state.
- Axios for HTTP + auth header interceptor.
- CSS modules/files per page/component style concerns.

### 6.2 Structure
- `src/pages/Admin/*` admin dashboards and CRUD screens.
- `src/pages/Cashier/*` cashier dashboard, sale creation, sale history.
- `src/components/*` shared shell components (navbar/sidebar) and receipt UI.
- `src/api/*` service wrappers per domain.
- `src/context/AuthContext.jsx` auth state/actions.
- `src/utils/printReceipt.js` print helper.

### 6.3 State management approach
- Local component state for forms/tables/errors/loading.
- AuthContext global state for current user + login/logout functions.
- No Redux; complexity managed with hook-level state.

### 6.4 Authentication flow
- Login form submits credentials through context `login()`.
- Token returned and decoded using `jwt-decode`.
- `sub` and `role` become `user` object in context.
- Token persisted to `localStorage`.
- Axios interceptor injects bearer token.
- Route protection via `PrivateRoute` role checks in `App.jsx`.
- Logout clears storage and redirects to login.

### 6.5 Page/features breakdown
- **Admin Dashboard**: aggregates counts/revenue from categories/products/users/sales API calls.
- **Category Management**: create/edit/delete categories with inline form reuse and error banner.
- **Product Management**: create/edit/delete products with category selector, unit-aware stock input step.
- **Users/Cashier Management**: admin creates cashiers and lists cashier accounts.
- **Cashier Dashboard**: displays cashier-centric summary/stat cards.
- **Create Sale UI**:
  - Product search suggestions (client filter + top 6 cap).
  - Add-to-bill behavior with unit-specific default quantity.
  - Editable quantity table.
  - Grand total calculation.
  - Submit to backend and success/error feedback.
- **My Sales**:
  - Fetch cashier sales.
  - Show invoice/date/amount list.
  - View receipt in modal.
- **Receipt View**:
  - Render printable receipt layout with itemized lines and shop metadata.
  - Trigger print via popup window and print stylesheet.

---

## 7. Frontend Logic & UX Decisions

### 7.1 Product search vs full list
- Search-first interaction avoids rendering huge scroll lists in cashier flow.
- Faster item add for checkout use-case; limits cognitive load.
- Suggestion list capped to 6 to keep dropdown manageable.

### 7.2 Handling larger product sets
- In-memory filtering on fetched products for quick type-ahead.
- For very large datasets, backend query/pagination would be next scaling step (not currently implemented).

### 7.3 Editable cart table
- Quantity can be edited inline with unit-based step constraints (`1` for UNIT, `0.01` for KG).
- Remove action allows correction without restarting bill.
- Same product add increments existing line rather than duplicating rows.

### 7.4 Error banners and alerts
- Category/Product pages use persistent error banners for failed CRUD operations.
- Login/Create-user/Create-sale use alert blocks with context-sensitive messages.
- Error extraction typically tries `err.response?.data?.message`, with fallback strings.

### 7.5 Form handling patterns
- Controlled components for inputs/selects.
- Shared form state objects for complex forms (product screen).
- Edit mode toggling (`editId`) reuses same form for create/update.
- Client-side required attributes are used, with backend validation as authority.

---

## 8. Database Design (PostgreSQL)

### 8.1 Core tables/entities
- `users`
- `category`
- `product`
- `sale`
- `sale_item`
- (Table naming may follow Hibernate conventions if not explicitly set; `users` explicitly set for User.)

### 8.2 Relationships
- `product.category_id -> category.id` (many products per category).
- `sale.cashier_id -> users.id` (many sales per cashier).
- `sale_item.sale_id -> sale.id` (many lines per sale).
- `sale_item.product_id -> product.id` (many sale lines per product over time).

### 8.3 Constraints and integrity
- Unique constraints:
  - `users.username`
  - `category.name`
  - `sale.invoiceNumber`
- Not-null constraints on critical fields (role/password/username/price/unitType/invoiceNumber).
- Service-level prechecks complement DB constraints for clearer client-facing errors.

### 8.4 Data type choices
- `BigDecimal` for money and quantity-related columns.
- Prevents float precision drift and supports weighted-selling domain.
- Timestamp uses `LocalDateTime` for transaction audit trail.

### 8.5 Why JPA/Hibernate instead of raw SQL
- Rapid CRUD generation via repository interfaces.
- Derived query methods reduce boilerplate (`existsByNameIgnoreCase`, etc.).
- Entity relationship mapping simplifies join handling.
- Trade-off: some reporting logic currently computes in-memory after `findAll` rather than pushing aggregation to SQL.

---

## 9. Error Handling

### 9.1 Backend pattern
- Business/validation failures throw `ResponseStatusException` with proper HTTP code and message.
- `GlobalExceptionHandler` normalizes errors into JSON payloads.
- Unhandled exceptions return generic 500 body to avoid leaking internals.

### 9.2 Frontend pattern
- API calls wrapped in `.catch` branches updating UI-level error state.
- Messages surfaced in banners/alerts near forms for immediate action.
- Success states often auto-clear after timeout.

### 9.3 Common issue categories (from implementation evidence)
- **CORS**: explicit CORS bean and preflight allowance indicate cross-origin integration challenges were addressed.
- **JWT decode/parsing**: frontend wraps decode in `try/catch`; logs decode failure.
- **Infinite JSON recursion risk**: sale/product/category relationships could recurse; response DTO mapping in sales and category DTO usage mitigate this.
- **FK constraint/delete dependency**: category delete guard prevents deleting categories still referenced by products.

---

## 10. DevOps & Deployment Plan

### 10.1 Docker usage
- Root `docker-compose.yml` orchestrates:
  - PostgreSQL 15 Alpine (persistent volume + healthcheck).
  - Spring Boot backend (build image, env-driven datasource/JWT/CORS, healthcheck).
  - React frontend via Nginx (serves static build, proxies `/api` to backend).
- Separate Dockerfiles for backend (Maven multi-stage) and frontend (Node build + Nginx runtime).

### 10.2 CI/CD status and Jenkins
- Jenkins pipeline files are not present in repository.
- Practical plan from current setup would be:
  1. Lint/test frontend + backend in CI.
  2. Build Docker images.
  3. Push to registry.
  4. Deploy compose stack (or Kubernetes equivalent).

### 10.3 GitHub usage
- Repository structure supports standard GitHub flow (branching, PRs, containerized deployment).
- Readme references separate frontend/backend origins, indicating merged or mirrored mono-repo snapshot.

### 10.4 Planned 3-tier deployment shape
- Web tier: Nginx-hosted React app.
- App tier: Spring Boot API container.
- Data tier: PostgreSQL container/managed DB.
- Internal Docker network isolates east-west traffic; only 80/8080/5432 exposed as configured.

### 10.5 Alternatives to AWS EC2 (deployment targets)
- Since app is containerized, straightforward alternatives include:
  - DigitalOcean Droplets.
  - Azure VM / Container Apps.
  - Google Compute Engine / Cloud Run.
  - Render / Railway / Fly.io for simpler managed container hosting.
  - On-prem Linux host with Docker Compose.

---

## 11. Design Decisions & Trade-offs

### 11.1 JWT vs server sessions
- Chosen for stateless horizontal scalability and frontend-friendly API auth.
- Trade-off: token revocation/session invalidation is harder without denylist/rotation features.

### 11.2 BigDecimal for money/weight
- Prevents binary floating-point rounding errors.
- Supports heterogeneous quantity semantics (unit and weight) with one arithmetic path.
- Trade-off: requires deliberate parsing and rounding policies.

### 11.3 DTOs vs entity exposure
- DTOs used where response shaping matters (sales/receipt/report) to control payload structure and avoid recursive graphs.
- Entity exposure retained in simpler CRUD endpoints for speed.
- Trade-off: mixed API style; stricter DTO-only approach would increase long-term safety/consistency.

### 11.4 Layered architecture
- Improves testability and maintenance by isolating concerns.
- Service layer centralizes business rules and domain invariants.
- Trade-off: more classes/indirection than quick single-layer controllers.

### 11.5 Performance considerations
- Current implementation often uses `findAll()` then in-memory filtering/aggregation (sales by cashier, reports).
- Adequate for small/medium data volumes; may degrade at scale.
- Optimizations to consider: repository-level filtering, pagination, DB-side aggregations/indexing.

---

## 12. Real Problems Faced & Solutions (as evidenced by code)

### 12.1 Duplicate category/product names
- **Root cause**: users entering same names with different letter casing/spacing.
- **Fix**: trim input + case-insensitive existence checks before save/update.
- **Lesson**: normalize data before uniqueness checks.

### 12.2 Category deletion with dependent products
- **Root cause**: attempted delete while products still reference category.
- **Fix**: service pre-check using `existsByCategoryId`, return clear 400 message.
- **Lesson**: domain-friendly pre-validation gives better UX than raw DB exception leaks.

### 12.3 Insufficient stock during checkout
- **Root cause**: requested quantity exceeds available inventory.
- **Fix**: compare stock vs request for each sale line and block with contextual error.
- **Lesson**: inventory checks must run server-side regardless of frontend constraints.

### 12.4 JWT decode/auth mismatch issues
- **Root cause**: malformed/expired tokens or claim interpretation issues.
- **Fix**: backend token validation + frontend decode guard in `try/catch`.
- **Lesson**: auth flows need robust fallback/error handling on both sides.

### 12.5 CORS integration failures
- **Root cause**: frontend and backend run on different origins in dev/deployment.
- **Fix**: centralized CORS configuration, configurable allowed origins, explicit OPTIONS allowance.
- **Lesson**: treat CORS as first-class deployment configuration.

### 12.6 Potential role-prefix mismatch for method security
- **Root cause**: `hasRole('ADMIN')` expects `ROLE_ADMIN` convention while filter sets authority to `ADMIN`.
- **Fix direction**: either switch to `hasAuthority('ADMIN')` or map authorities with `ROLE_` prefix + enable method security explicitly.
- **Lesson**: keep authority naming conventions consistent across token, filter, and annotations.

### 12.7 Historical price representation gap in receipts
- **Root cause**: receipt `unitPrice` currently read from current product state, not immutable per-item unit snapshot.
- **Fix direction**: store `unitPriceAtSale` separately in `SaleItem` and calculate line total from snapshot.
- **Lesson**: financial history requires immutable price snapshots to preserve audit correctness.

### 12.8 In-memory reporting scalability risk
- **Root cause**: reports and cashier filtering iterate all sales in application memory.
- **Fix direction**: move filters/aggregates to repository-level queries with pagination/indexing.
- **Lesson**: analytics should be pushed closer to DB as data grows.
