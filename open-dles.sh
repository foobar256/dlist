#!/usr/bin/env bash
set -euo pipefail

# Trivia/knowledge-heavy daily-style games.
urls=(
  "https://www.foodguessr.com/"                 # food, geography
  #"https://globle-game.com/"                   # geography (i don't like)
  "https://worldle.teuteuf.fr/"                # geography, map
  "https://travle.earth/"                      # geography, pathing
  "https://flagle.io/"                         # flags, geography
  #"https://capitale.world/"                    # geography, capitals (not working)
  #"https://www.tradle.app/"                    # geography, trade (not working)
  "https://www.gamedle.wtf/"                   # video games
  #"https://moviedle.xyz/"                      # movies (I don't watch movies)
  #"https://framed.wtf/"                        # movies (I don't watch movies)
  #"https://www.nerdlegame.com/"                # math (don't like)
  #"https://mathle.app/"                        # math (not working)
  #"https://www.quordle.com/"                   # words (don't like)
  #"https://www.octordle.com/"                  # words (don't like)
  #"https://www.sedecordle.com/"                # words (don't like)
  #"https://www.wafflegame.net/"                # words (don't like)
  #"https://www.nytimes.com/games/wordle/index.html" # words (don't like)
  "https://www.nytimes.com/games/connections"  # words, logic, categories
  #"https://www.nytimes.com/games/strands"      # words (don't like)
  "https://contexto.me/"                       # words, semantics
  "https://www.chronophoto.app/daily.html"     # history, photography
  "https://timeguessr.com/"                    # geography, history, photography
  "https://wikitrivia.tomjwatson.com/"         # history, timeline
  "https://bandle.app/"                        # music, intro
  "https://wheretaken.teuteuf.fr/"             # geography, photography
  "https://metazooa.com/"                      # animals, biology
  "https://factle.app/"                        # trivia, rankings
  #"https://cloudle.app/"                       # weather, geography (not working)
  "https://costcodle.com/"                     # shopping, prices
  "https://guessthe.game/"                     # video games, screenshots
  #"https://languessr.com/"                     # languages, audio (not working)
  #"https://satle.victr.me/"                    # geography, satellite (not working)
  #"https://www.nga.gov/artle.html"             # art, artist (don't know art)
  #"https://pokedle.net/"                       # pokemon (don't know pokemon)
  #"https://birdle.net/"                        # birds (not working)
  "https://guesstheaudio.com/"
  "https://guessthelogo.wtf/"
)

if pgrep -x waterfox >/dev/null 2>&1; then
  for url in "${urls[@]}"; do
    waterfox --new-tab "$url"
  done
else
  waterfox "${urls[0]}"
  for url in "${urls[@]:1}"; do
    waterfox --new-tab "$url"
  done
fi
