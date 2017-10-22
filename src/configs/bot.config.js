module.exports = {
    port: process.env.FACEBOOK_TIMETABLE_BOT_PORT || 3000,
    token: process.env.FACEBOOK_TIMETABLE_BOT_TOKEN,
    pageToken: process.env.FACEBOOK_TIMETABLE_BOT_PAGE_TOKEN,
    messagesApiUrl: 'https://graph.facebook.com/v2.6/me/messages'
}