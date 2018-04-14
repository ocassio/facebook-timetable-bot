const express = require('express')
const bodyParser = require('body-parser')
const io = require('socket.io-client')
const SenderService = require('./services/sender.service')
const { toPlatformUserId, toFacebookUserId, decodeAction } = require('./utils')
const { port, token } = require('./configs/bot.config')
const { platformUrl, clientName, shortMessages, token: platformToken } = require('./configs/platform.config')

const socket = io(platformUrl, { query: `name=${clientName}&shortMessages=${shortMessages}` })

socket.on('connect', () => {
    console.log('Connection with the platform established successfully')
    console.log('Performing authentication...')
    socket.emit('authentication', { token: platformToken })
})

socket.on('authenticated', () => console.log('Authentication process completed successfully'))
socket.on('disconnect', () => console.log('Connection with the platform has been dropped'))
socket.on('connect_error', () => console.error('There is some connection problem'))

socket.on('sendMessage', data => {
    if (!data.recipients) return
    data.recipients.forEach(userId => SenderService.queueMessage(toFacebookUserId(userId), data))
})


const app = express()
app.use(bodyParser.json())

app.get('/webhook', (request, response) => {
    const {
        'hub.mode': mode,
        'hub.verify_token': verifyToken,
        'hub.challenge': challenge
    } = request.query
    if (mode === 'subscribe' && token === verifyToken) {
        console.log('Webhook validated successfully')
        response.status(200).send(challenge)
    } else {
        console.error('Webhook validation failed')
        response.sendStatus(403)
    }
})

app.post('/webhook', (request, response) => {
    const body = request.body
    if (body.object !== 'page') {
        response.sendStatus(404)
        return
    }

    body.entry.forEach(entry => {
        const event = entry.messaging[0];        
        const senderPSID = event.sender.id
        if (event.message) {
            handleMessage(senderPSID, event.message)
        }
    })

    response.status(200).send('EVENT_RECEIVED')
})

app.listen(port, () => console.log(`Server started on port ${port}`))

function handleMessage(userId, message) {
    if (!message.text) return

    let params = { userId: toPlatformUserId(userId) }

    if (message.quick_reply) {
        const action = decodeAction(message.quick_reply.payload)
        params = Object.assign(params, action)
    } else {
        params.action = 'response'
        params.value = message.text
    }

    socket.emit('action', params)
}