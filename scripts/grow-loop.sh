#!/bin/bash
# Thin entrypoint for the UK data lab grow loop.
# Shared logic lives in code/usa-uk-data-stack/loops/loop-wrapper.sh.
exec "$HOME/code/usa-uk-data-stack/loops/loop-wrapper.sh" \
  "$HOME/code/uk-data-lab" \
  "$HOME/code/uk-data-lab/scripts/grow-loop-prompt.txt" \
  "$HOME/code/uk-data-lab/scripts/heal-grow-loop-prompt.txt" \
  uk-data-lab
