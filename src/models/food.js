class Food {
    constructor(id, name, category, price, ingredients, allergens, vegetarian, perishable, validity, season, region, restaurant) {
        this.id = id;
        this.name = name;
        this.category = category;
        this.price = price;
        this.ingredients = ingredients;
        this.allergens = allergens;
        this.vegetarian = vegetarian;
        this.perishable = perishable;
        this.validity = validity;
        this.season = season;
        this.region = region;
        this.restaurant = restaurant;
    }
}

module.exports = Food;
