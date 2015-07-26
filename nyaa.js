#!/usr/bin/env node
'use strict'

var assert = require('assert')
var Promise = require('es6-promise').Promise
var requestPromise = require('request-promise')


function grabPage(uri, page) {
    return requestPromise(uri + page)
        .then(function(rss) {
            var links = [];
            var titles = []
            rss.toString().replace(/<link>([\s\S]*?)<\//g, function(_, link) {
                if(/page=download/.test(link))
                    links.push({ link: link.replace('&#38;', '&') })
            })
            var i = 0
            rss.toString().replace(/<title>([\s\S]*?)<\//g, function(_, title) {
                if(i!==0) {
                    links[i-1].name = title
                }
                i++
            })
            return links
        })
}

function getTorrent(torrent) {
    return requestPromise.get(torrent, { encoding: null })
}

var categories = [
    '7_25',  // Art - Anime
    '7_33',  // Art - Doujinshi
    //'7_27',  // Art - Games
    //'7_26',  // Art - Manga
    //'7_28',  // Art - Pictures
    //'8_31',  // Real Life - Photobooks &amp; Pictures
    '8_30'   // Real Life - Videos
]

var sortTypes = [
    '',         // default (date)
    '&sort=2',  // Seeders
    '&sort=3',  // Leechers
    '&sort=4',  // Download
    '&sort=5',  // Size
    '&sort=6',  // Name
]

var sortOrders = [
    '',
    '&order=2'
]

module.exports = {
    listMovies: function(opt, cb) {
        var url = [
            'http://www.nyaa.se/',
            '?page=rss',
            '&term=' + (opt && opt.query_term ? opt.query_term:'')+' [720p]',
            '&maxsize=1000',  // Exclude them anime collections
            '&cats=1_37',
            '&sort=2'
        ].join('')
        console.log('going to', url)
        grabPage(url)
        .then(function (links) {
            if (!links.length) {
                throw new Error('No movies found')
            }
            return {
                data: {
                    movies: links.map(function(link) {
                        link.id = +link.link.replace(/.+&tid=(\d+).+/, '$1')
                        console.log(link.id)
                        link.title_long = link.name
                        return link
                    })
                }
            }
        })
        .then(function(res){cb(null,res)}, function(err){cb(err)})
    },
    movieDetails: function(id, cb) {
        id = id.movie_id

        var url = 'http://www.nyaa.se/?page=download&tid=' + id + '&txt=1'

        setTimeout(cb.bind(null, null, {
            data: {
                torrents: [
                    { url: url, quality: '720p' },
                    { url: url, quality: '1080p' },
                    { url: url, quality: '3d' }
                ]
            }
        }))
    },
    getSubtitles: function(imdb_code, cb){
        setTimeout(function() {
            cb(null, { subs: [ { url: true }, 'yeah bro shift me' ] })
        })
    },
    fetchSubtitle: function(_, __, cb) {
        setTimeout(cb)
    }
}

