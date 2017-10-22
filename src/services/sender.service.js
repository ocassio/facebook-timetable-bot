const axios = require('axios')
const { messagesApiUrl, pageToken } = require('../configs/bot.config')

const queuePool = {}

function queueRequest(userId, message) {
    if (!queuePool[userId]) {
        queuePool[userId] = {}
    }

    const queue = queuePool[userId]
    if (!queue.messages) {
        queue.messages = []
    }
    console.log(message.text.length)
    queue.messages.push(message)

    if (queue.processing) {
        return
    }
    queue.processing = true
    console.log('Queue is locked')
    processQueue(userId, queue)
}

async function processQueue(userId, queue) {
    if (queue.messages.length === 0) {
        queue.processing = false
        console.log('Queue is unlocked')
        return
    }

    const message = queue.messages.shift()
    await SenderService.sendMessage(userId, message)
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
            console.log('Message has been sent')
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
    static sendTextMessage(userId, text, keyboard) {
        const message = {
            text,
            quick_replies: keyboard
        }
        queueRequest(userId, message)
    }

}

module.exports = SenderService