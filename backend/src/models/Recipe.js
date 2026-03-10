class RecipeResponse {
    constructor(data) {
        this.id = data.recipe_id;
        this.title = data.title;
        this.instructions = data.instructions;
        this.image_url = data.image_url ?? null;
        this.yield_amount = data.yield_amount ?? null;
        this.yield_unit = data.yield_unit ?? null;
        this.ingredients = data.ingredients ?? [];
        this.created_at = data.created_at;
    }
}

export default RecipeResponse;