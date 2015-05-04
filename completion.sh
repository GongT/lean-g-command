#!/bin/sh
# bash completion support for avoscloud
# Copyright (C) 2014, AVOS Cloud <support@avoscloud.com>
# Distributed under the GNU General Public License, version 2.0.
# Usage:
#
#    1) Copy this file to somewhere (e.g. ~/.avoscloud_completion.sh).
#    2) Add the following line to your .bashrc/.bash_profile
#        source ~/.avoscloud_completion.sh
_environments()
{
  if [[ -d "config/environment" ]]; then
    for name in config/environment/*.json
    do
    name=${name##*/}
    echo ${name%.json}
    done
  fi
}

_servers()
{
  if [[ -d "config/server" ]]; then
    for name in config/server/*.json
    do
    name=${name##*/}
    echo ${name%.json}
    done
  fi
}

_commands()
{
  if [[ -d "config/environment" ]]; then
    for name in cloud/lean-g/scripts/commands/*.js
    do
    name=${name##*/}
    echo ${name%.js}
    done
  else
    echo 'init'
  fi
  echo 'dependence'
  echo 'config'
}

_leang()
{
    local cur prev
    _get_comp_words_by_ref cur prev
    
    if [[ "$prev" == "leang" ]]; then
        COMPREPLY=($( compgen -W "$(_commands)" -- ${cur}))
        return
    fi
    
    if [[ "${prev}" == 'init' ]]; then
        COMPREPLY=()
    elif [[ "${prev}" == 'config' ]]; then
        COMPREPLY=()
    elif [[ "${prev}" == 'dependence' ]]; then
        COMPREPLY=()
    elif _commands | grep -qs "^${prev}$" ; then
        COMPREPLY=($( compgen -W "$(_environments)" -- ${cur}))
    elif _environments | grep -qs "^${prev}$" ; then
        COMPREPLY=($( compgen -W "$(_servers)" -- ${cur}))
    else
        COMPREPLY=()
    fi
} && 
complete -F _leang leang
