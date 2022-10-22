"use strict";

module.exports = {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register(/*{ strapi }*/) {},

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  async bootstrap(/*{ strapi }*/) {
    const { faker } = require("@faker-js/faker");
    const postNb = 25;
    const mediaNb = postNb;
    const authorNb = 5;
    const categoryNb = 10;

    let authors = [];
    let categories = [];

    const authorCount = await strapi.db.query("api::author.author").count();
    const categoryCount = await strapi.db
      .query("api::category.category")
      .count();
    const postCount = await strapi.db.query("api::post.post").count();
    const mediaCount = await strapi.db.query("api::image.image").count();

    const uploads = await strapi.db.query("plugin::upload.file").findMany();
    let uploadsId = new Set(uploads.map((upload) => upload.id));

    if (mediaCount <= 0) {
      // Create images with uploads
      for (let i = 0; i < mediaNb + 1; i++) {
        const randId =
          Array.from(uploadsId)[Math.floor(Math.random() * uploadsId.length)];

        await strapi.db.query("api::image.image").create({
          data: {
            media: randId,
          },
        });

        uploadsId = Array.from(uploadsId).filter((id) => id !== randId);
      }
    }

    // Creates Image ID array
    const imagesStrapi = await strapi.db.query("api::image.image").findMany();
    const imageId = Array.from(new Set(imagesStrapi.map((image) => image.id)));

    if (authorCount <= 0) {
      // Creates fake authors names
      for (let i = 0; i < authorNb; i++) {
        const author = {
          firstName: faker.name.firstName(),
          lastName: faker.name.lastName(),
        };

        await strapi.db.query("api::author.author").create({
          data: {
            name: `${author.firstName} ${author.lastName}`,
          },
        });
      }
    }

    // Creates author ID array
    const authorsStrapi = await strapi.db
      .query("api::author.author")
      .findMany();
    const authorID = [];

    authorsStrapi.forEach((author) => authorID.push(author.id));

    // Creates fake category names
    if (categoryCount <= 0) {
      for (let i = 0; i < categoryNb; i++) {
        const category = {
          label: faker.commerce.department(),
        };

        categories.push(category);
      }

      let categoriesLabel = [];

      categories.forEach((category) => categoriesLabel.push(category.label));

      categoriesLabel = categoriesLabel.reduce(
        (acc, cat) => (acc.includes(cat) ? acc : [...acc, cat]),
        []
      );

      categories = [];

      categoriesLabel.forEach((category) => {
        categories.push({ label: category });
      });

      await strapi.db.query("api::category.category").createMany({
        data: categories,
      });
    }

    // Creates category ID array
    const categoriesStrapi = await strapi.db
      .query("api::category.category")
      .findMany();
    const categoryId = [];

    categoriesStrapi.forEach((category) => categoryId.push(category.id));

    // Creates fake blog posts
    if (postCount <= 0) {
      for (let i = 0; i < postNb; i++) {
        const authorRand =
          authorsStrapi[Math.floor(Math.random() * authorID.length)];
        const categoryRand =
          categoriesStrapi[Math.floor(Math.random() * categoryId.length)];
        const imageRand =
          imagesStrapi[Math.floor(Math.random() * imageId.length)];

        const post = {
          title: faker.lorem.sentence(),
          author: await strapi.db
            .query("api::author.author")
            .findOne({ where: { id: authorRand.id } }),
          description: faker.lorem.sentence(25),
          text: faker.lorem.paragraphs(15),
          category: await strapi.db
            .query("api::category.category")
            .findOne({ where: { id: categoryRand.id } }),
          image: await strapi.db
            .query("api::image.image")
            .findOne({ where: { id: imageRand.id } }),
        };

        await strapi.db.query("api::post.post").create({
          data: post,
        });
      }
    }
  },
};
