const axios = require('axios')
const { messagesApiUrl, pageToken } = require('../configs/bot.config')
const { getKeyboard } = require('../utils')

const queuePool = {}

async function processQueue(userId, queue) {
    if (queue.messages.length === 0) {
        queue.processing = false
        return
    }

    const meta = queue.messages.shift()
    await SenderService.sendMessages(userId, meta)
    processQueue(userId, queue)
}

class SenderService {

    /**
     * Sends Facebook formatted message
     * 
     * @static
     * @param {string} userId Recipient ID
     * @param {object} message Facebook formatted message
     * @memberof SenderService
     */
    static async sendMessage(userId, message) {
        const params = {
            recipient: {
                id: userId
            },
            message
        }
        try {
            await axios.post(`${messagesApiUrl}?access_token=${pageToken}`, params)
        } catch (e) {
            console.error(`Error during sending a response: ${e}`)
        }
    }

    /**
     * Sends text message with optional keyboard
     * 
     * @static
     * @param {string} userId Recipient ID
     * @param {string} text Text
     * @param {Array<object>=} keyboard Keyboard
     * @memberof SenderService
     */
    static async sendTextMessage(userId, text, keyboard) {
        const message = {
            text,
            quick_replies: keyboard
        }
        await SenderService.sendMessage(userId, message)
    }

    /**
     * Sends messages based on the meta info
     * 
     * @static
     * @param {string} userId User ID
     * @param {object} meta Meta info
     * @memberof SenderService
     */
    static async sendMessages(userId, meta) {
        const messages = meta.messages
        const keyboard = getKeyboard(meta)
        
        for (let i = 0; i < messages.length - 1; i++) {
            await SenderService.sendTextMessage(userId, messages[i])
        }
    
        const lastMessage = messages[messages.length - 1]
        if (lastMessage) {
            await SenderService.sendTextMessage(userId, lastMessage, keyboard)
        }
    }

    /**
     * Queues message for sending
     * 
     * @static
     * @param {string} userId User ID
     * @param {message} meta Message meta
     * @memberof SenderService
     */
    static queueMessage(userId, meta) {
        if (!queuePool[userId]) {
            queuePool[userId] = {}
        }
    
        const queue = queuePool[userId]
        if (!queue.messages) {
            queue.messages = []
        }
        queue.messages.push(meta)
    
        if (queue.processing) {
            return
        }
        queue.processing = true
        processQueue(userId, queue)
    }

}

module.exports = SenderService