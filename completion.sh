#!/bin/sh
# bash completion support for avoscloud
# Copyright (C) 2014, AVOS Cloud <support@avoscloud.com>
# Distributed under the GNU General Public License, version 2.0.
# Usage:
#
#    1) Copy this file to somewhere (e.g. ~/.avoscloud_completion.sh).
#    2) Add the following line to your .bashrc/.bash_profile
#        source ~/.avoscloud_completion.sh
_apps()
{
  if [[ -d "config" ]]; then
    local words
    words=$(node -e "require('fs').readdirSync('config').filter(function(k){return k != 'global.json';}).forEach(function(k){console.log(k.split(/\./)[0])})")
    echo $words
  fi
}
_commands()
{
  if [[ -d "config" ]]; then
    local words
    words=$(node -e "require('fs').readdirSync('cloud/lean-g/scripts/commands').forEach(function(k){console.log(k.split(/\./)[0])})")
    echo $words
  fi
}
_leang()
{
    local cur prev
    _get_comp_words_by_ref cur prev
    
    if [[ "$prev" == "leang" ]]; then
        CONFIGS=$(_apps ; echo init; echo dependence; echo config; )
        COMPREPLY=($( compgen -W '${CONFIGS}' -- ${cur}))
        return 0
    fi
    
    if echo "$(_apps)" | grep -qs "$prev" ; then
        COMPREPLY=($( compgen -W '$(_commands)' -- ${cur}))
    else
        COMPREPLY=()
    fi
} &&
complete -F _leang leang
