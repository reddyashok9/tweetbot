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
            })
        } else {
            console.log('Something went wrong while searching.')
        }
    })
}

sendDirectMessage()
