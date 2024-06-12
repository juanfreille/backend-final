import { fakerES as faker } from "@faker-js/faker";

export const generateProduct = () => {
  return {
    _id: faker.database.mongodbObjectId(),
    title: faker.commerce.productName(),
    description: faker.commerce.productAdjective(),
    price: faker.commerce.price(),
    thumbnails: [faker.image.url()],
    code: faker.string.alphanumeric(6),
    stock: +faker.string.numeric(1),
    category: faker.commerce.productMaterial(),
  };
};
