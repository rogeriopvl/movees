# Movees

## Info

Movees is a popcorn-time like client for the command line. It searches movies and can play them (with subtitles) by streaming torrent files using Peerflix and VLC.

## Install

    npm install -g movees

### Dependencies

- VLC

## Usage

### Step 1 - Search movie

    movees --search "<name_of_movie>"

**Note:** You should use double quotes around movie names that have more than one word or have non alpha-numeric characters.

### Step 2 - Play movie
Then copy the ID of the movie, and use it in the following command:

    movees --watch <movie_id> --subs portuguese

### More options

    movees --latest [--page <page number>] [--limit <number of movies p/page>] show latest movies
    movees --info <movie_id>    # will open your browser with the movie info page

    movees --help

    movees --version

## Legal Notice

ALL MOVIES ARE NOT HOSTED IN ANY SERVER AND ARE STREAMED USING THE P2P BIT TORRENT PROTOCOL. ALL MOVIES ARE PULLED IN FROM THE YIFY MOVIE DATABASE. BY WATCHING A MOVIE WITH THIS APPLICATION YOU MIGHT BE COMMITING COPYRIGHT VIOLATIONS DEPENDING ON YOUR COUNTRY'S LAWS. MOVEES DEVELOPERS DO NOT TAKE ANY RESPONSIBILITIES.

## License

Copyright (c) 2015 Movees

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
