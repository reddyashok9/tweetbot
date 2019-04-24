const Twit = require('twit')
const config = require('./config')
const helpers = require('./helpers')

require('./db')
const db = require('./controller')

const Twitter = new Twit(config)

const sendDirectMessage = function () {
    const params = {
        q: '#blockchain OR #bitcoin, -filter:retweets',
        result_type: 'recent',
        lang: 'en'
    }

    Twitter.get('search/tweets', params, function (err, data) {
        if (!err) {
            db.getUniqueTweets(data.statuses).then((tweets) => {
                const content = helpers.composeContent(tweets)
                db.recordUniqueTweets(tweets)

                Twitter.get('followers/ids', {
                    user_id: 1,
                    screen_name: 'ashokreddykl'
                }, (err, response) => {
                    if (err) {
                        console.log('Something went wrong while getting followers. Error: ', err)
                    }

                    if (response) {
                        response.ids.forEach((id) => {
                            Twitter.post('direct_messages/events/new', {
                                event: {
                                    'type': 'message_create',
                                    'message_create': {
                                        'target': {
                                            'recipient_id': id
                                        },
                                        'message_data': {
                                            'text': content,
                                        }
                                    }
                                }
                            }, (err, response) => {
                                if (err) {
                                    console.log('Something went wrong while sending message. Error: ', err)
                                } else {
                                    if (response) {
                                        console.log('Message sent. Response: ', response)
                                    }
                                }
                            })
                        })
                    }
                })
            })
        } else {
            console.log('Something went wrong while searching.')
        }
    })
}

sendDirectMessage()