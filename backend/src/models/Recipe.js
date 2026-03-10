class RecipeResponse {
    constructor(data){
        this.id = data.recipe_id;
        this.title = data.title;
        this.instructions = data.instructions;
    }
}