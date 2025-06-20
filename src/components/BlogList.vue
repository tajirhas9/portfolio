<template>
  <div class="blog-list-container">
    <div
      class="blog-categories"
      v-if="uniqueCategoriesArray.length > minCategories"
    >
      <h2 class="heading">Categories</h2>
      <ul>
        <li
          v-for="category in uniqueCategoriesArray"
          :key="category"
          @click="updateCategory(category)"
          class="blog-category"
        >
          {{ category }}
        </li>
      </ul>
    </div>
    <div class="blog-list" :key="selectedCategory">
      <div
        v-for="post in posts.data"
        :key="post.frontmatter.title"
        class="blog-item"
      >
        <a :href="post.url" class="title">{{ post.frontmatter.title }}</a>
        <p class="date">
          {{ formatDate(post.frontmatter.date) }}
        </p>
        <p class="description">
          {{ post.frontmatter.description }}
        </p>
      </div>
    </div>
  </div>
</template>
<script setup>
import { reactive, defineProps, onMounted } from "vue";
import { formatDate } from "../js/utils";

const props = defineProps({
  allPosts: {
    type: Array,
  },
});
const minCategories = 2;
const posts = reactive({ data: [] });
const selectedCategory = reactive({ value: null });

posts.data = props.allPosts.sort((a, b) => {
  return new Date(b.frontmatter.date) - new Date(a.frontmatter.date);
});
const uniqueCategories = new Set(
  posts.data.map((post) => post.frontmatter.category).filter(Boolean)
);

uniqueCategories.add("All");

const uniqueCategoriesArray = Array.from(uniqueCategories);
uniqueCategoriesArray.sort();

onMounted(() => {
  if (uniqueCategoriesArray.length > minCategories) {
    document.querySelector(".blog-list").classList.add("has-categories");
  } else {
    document.querySelector(".blog-list").classList.add("no-categories");
  }
});

const updateCategory = (category) => {
  console.log(`Updating category to: ${category}`);
  if (category === "All") {
    posts.data = props.allPosts.sort((a, b) => {
      return new Date(b.frontmatter.date) - new Date(a.frontmatter.date);
    });
    selectedCategory.value = null;
    return;
  }
  selectedCategory.value = category;
  posts.data = Object.values(
    props.allPosts.filter((post) => post.frontmatter.category === category)
  );
};
</script>

<style scoped>
.blog-list-container {
  margin: auto;
  max-width: 100%;
  width: 100%;
  clear: both;
}
.blog-categories {
  text-align: right;
  padding-right: 20px;
  width: 20%;
  margin-top: 50px;
  float: left;
  line-height: 1.5;
  .heading {
    font-size: 1.2em;
    color: var(--text-color);
    margin-bottom: 20px;
  }
  .blog-category {
    cursor: pointer;
  }
  .blog-category:hover {
    text-decoration: underline;
  }
}
.blog-list {
  width: 70%;
}

.has-categories {
  float: right;
}
.no-categories {
  width: 100%;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.blog-item {
  width: 50%;
  margin-left: 0;
  margin-top: 20px;
  padding: 10px;
  background-color: var(--background-color);
  border-radius: 5px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  .title {
    font-size: 1.2em;
    color: var(--text-color);
  }
  .date {
    font-size: 0.9em;
    color: #999;
  }
  .description {
    font-size: 0.9em;
    color: #666;
  }
}

a {
  color: var(--text-color);
  text-decoration: none;
}
a:hover {
  text-decoration: underline;
}
ul {
  list-style: none;
  padding: 0;
  max-width: 45em;
  margin: 0 auto;
}

@media screen and (max-width: 60em) {
  .blog-categories {
    margin-left: 10px;
  }
  .blog-list {
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }

  .blog-item {
    align-self: center;
    width: 80%;
    padding: 10px;
    margin: 10px auto;
  }
}
</style>
