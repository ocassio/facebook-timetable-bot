const { userIdPrefix } = require('./configs/platform.config')

/**
 * Converts Facebook user id to the Platform one
 * 
 * @param {string} userId Facebook user id
 * @returns {string} Platform user id
 */
function toPlatformUserId(userId) {
    return userIdPrefix + userId
}

/**
 * Converts Platform user id to Facebook one
 * 
 * @param {string} userId Platform user id
 * @returns {string} Facebook user id
 */
function toFacebookUserId(userId) {
    return userId.replace(userIdPrefix, '')
}

/**
 * Forms a Facebook keyboard based on the Platform message format
 * 
 * @param {Object} meta Platform message
 * @returns {Array} Facebook keyboard
 */
function getKeyboard(meta) {
    if (!meta.buttons || meta.buttons.length === 0) {
        return
    }
    return meta.buttons.map(button => {
        return {
            content_type: 'text',
            title: button.label,
            payload: encodeAction(button.action, button.params)
        }
    })
}

/**
 * Encodes action name and params to callback data string
 * 
 * @param {string} name Action name
 * @param {object} params Action params
 * @returns {string} Encoded callback data
 */
function encodeAction(name, params) {
    let result = name
    if (params) {
        Object.keys(params).forEach(name => {
            const value = params[name]
            if (value) {
                result += `|${name}=${JSON.stringify(value)}`
            }
        })
    }
    return result
}

/**
 * Decodes action name and params from callback data string
 * 
 * @param {string} data Callback data
 * @returns {object} Decoded action with params
 */
function decodeAction(data) {
    const sections = data.split('|')
    const params = { action: sections[0] }
    
    sections.shift()    
    sections.forEach(section => {
        const subsections = section.split('=')
        params[subsections[0]] = JSON.parse(subsections[1])
    })

    return params
}

module.exports = {
    toPlatformUserId,
    toFacebookUserId,
    getKeyboard,
    encodeAction,
    decodeAction
}