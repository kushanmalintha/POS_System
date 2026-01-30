package com.example.pos.product;

import com.example.pos.category.Category;
import com.example.pos.category.CategoryRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;

    // CREATE Product
    public Product create(ProductRequest request) {

        if (request.getCategoryId() == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Category ID is required"
            );
        }

        String normalizedName = request.getName().trim();

        // ✅ Prevent duplicate product names (case-insensitive)
        if (productRepository.existsByNameIgnoreCase(normalizedName)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Product with this name already exists"
            );
        }

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Category not found with ID: " + request.getCategoryId()
                ));

        Product product = Product.builder()
                .name(normalizedName)
                .price(request.getPrice())
                .stock(request.getStock())
                .category(category)
                .unitType(request.getUnitType())
                .build();

        return productRepository.save(product);
    }

    // GET ALL Products
    public List<Product> findAll() {
        return productRepository.findAll();
    }

    // UPDATE Product
    public Product update(Long id, ProductRequest request) {

        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Product not found"
                ));

        String normalizedName = request.getName().trim();

        // ✅ Prevent renaming to an existing product name
        if (
            productRepository.existsByNameIgnoreCase(normalizedName) &&
            !product.getName().equalsIgnoreCase(normalizedName)
        ) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Product with this name already exists"
            );
        }

        product.setName(normalizedName);
        product.setPrice(request.getPrice());
        product.setUnitType(request.getUnitType());
        product.setStock(request.getStock());


        if (request.getCategoryId() != null) {
            Category category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new ResponseStatusException(
                            HttpStatus.BAD_REQUEST,
                            "Category not found with ID: " + request.getCategoryId()
                    ));
            product.setCategory(category);
        }

        if (request.getUnitType() == UnitType.KG && request.getStock().scale() > 2) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Stock for KG unit type cannot have more than 2 decimal places"
            );
        }

        return productRepository.save(product);
    }

    // DELETE Product
    public void delete(Long id) {

        if (!productRepository.existsById(id)) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Product not found"
            );
        }

        productRepository.deleteById(id);
    }
}
