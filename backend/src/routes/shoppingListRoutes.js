import { Router } from 'express'
import { getShoppingList, postShoppingListItem, deleteShoppingListItem } from '../controllers/shoppingListController.js'

const router = Router()

router.get('/', getShoppingList)
router.post('/', postShoppingListItem)
router.delete('/:id', deleteShoppingListItem)

export default router