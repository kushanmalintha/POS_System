package com.example.pos.category;

import com.example.pos.product.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;

    public Category create(Category category) {

        String normalizedName = category.getName().trim();

        if (categoryRepository.existsByNameIgnoreCase(normalizedName)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Category with this name already exists"
            );
        }

        category.setName(normalizedName);
        return categoryRepository.save(category);
    }

    public List<Category> findAll() {
        return categoryRepository.findAll();
    }

    public Category update(Long id, Category updated) {

        Category category = categoryRepository.findById(id)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Category not found"
                        )
                );

        String normalizedName = updated.getName().trim();

        if (
            categoryRepository.existsByNameIgnoreCase(normalizedName) &&
            !category.getName().equalsIgnoreCase(normalizedName)
        ) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Category with this name already exists"
            );
        }

        category.setName(normalizedName);
        return categoryRepository.save(category);
    }

    public void delete(Long id) {

        if (!categoryRepository.existsById(id)) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Category not found"
            );
        }

        // Prevent deletion if products exist
        if (productRepository.existsByCategoryId(id)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Cannot delete category. Products exist under this category."
            );
        }

        categoryRepository.deleteById(id);
    }
}
