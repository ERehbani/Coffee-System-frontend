import { ESPRESSO_DTO_FIXTURE, ESPRESSO_FIXTURE, PRODUCT_CAFE_ID } from './product.fixture';
import { toProduct, toProducts, UNCATEGORIZED_LABEL } from './product.mapper';

describe('product mapper', () => {
  it('maps the cafe of the backend to the cafe id the cart compares against', () => {
    expect(toProduct(ESPRESSO_DTO_FIXTURE).cafeExternalId).toBe(PRODUCT_CAFE_ID);
  });

  it('keeps the data the catalog shows and drops the backend-only fields', () => {
    expect(toProduct(ESPRESSO_DTO_FIXTURE)).toEqual(ESPRESSO_FIXTURE);
  });

  it('labels a product without category', () => {
    const product = toProduct({ ...ESPRESSO_DTO_FIXTURE, categoryId: null, category: null });

    expect(product.category).toBe(UNCATEGORIZED_LABEL);
  });

  it('keeps the missing description, points and image as null', () => {
    const product = toProduct({
      ...ESPRESSO_DTO_FIXTURE,
      description: null,
      awardedPoints: null,
      image: null,
      tags: null,
    });

    expect(product.description).toBeNull();
    expect(product.awardedPoints).toBeNull();
    expect(product.image).toBeNull();
  });

  it('maps a list keeping the order of the backend', () => {
    const second = { ...ESPRESSO_DTO_FIXTURE, externalId: 'prod-2' };

    expect(toProducts([ESPRESSO_DTO_FIXTURE, second]).map((product) => product.externalId)).toEqual(
      [ESPRESSO_DTO_FIXTURE.externalId, 'prod-2'],
    );
  });
});
