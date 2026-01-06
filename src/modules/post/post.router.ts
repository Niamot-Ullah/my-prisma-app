import express, { Router } from 'express'
import { postController } from './post.controller'
import auth, { UserRole } from '../../middleware/auth'

const router = express.Router()

router.post('/',auth(UserRole.USER),postController.createPost)
router.get('/',postController.getPosts)
router.get('/:id',postController.getSinglePost)




export const postRouter = router