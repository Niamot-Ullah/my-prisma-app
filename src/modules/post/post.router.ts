import express, { Router } from 'express'
import { postController } from './post.controller'
import auth, { UserRole } from '../../middleware/auth'

const router = express.Router()

router.post('/',auth(UserRole.USER,UserRole.ADMIN),postController.createPost)
router.get('/my-posts',auth(UserRole.USER,UserRole.ADMIN),postController.getMyPosts)
router.get('/',postController.getPosts)
router.get('/:id',postController.getSinglePost)
router.put('/:id',auth(UserRole.USER,UserRole.ADMIN),postController.updatePost)
router.delete('/:id',auth(UserRole.USER,UserRole.ADMIN),postController.deletePost)




export const postRouter = router