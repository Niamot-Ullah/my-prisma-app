import express, { Router } from 'express'
import { commentController } from './comment.controller'
import auth, { UserRole } from '../../middleware/auth'

const router = express.Router()

router.post('/', auth(UserRole.ADMIN, UserRole.USER), commentController.createComment)
router.get('/:commentId', commentController.getCommentById)
router.get('/author/:authorId', commentController.getCommentByAuthorId)
router.delete('/:commentId', auth(UserRole.ADMIN, UserRole.USER), commentController.deleteComment)
router.put('/:commentId', auth(UserRole.ADMIN, UserRole.USER), commentController.updateComment)
router.patch('/moderate/:commentId',auth(UserRole.ADMIN),commentController.moderateComment)






export const commentRouter = router