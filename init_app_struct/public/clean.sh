#!/bin/sh

find -type f -name '*.less' -exec sh -c 'F='{}'; [ -f "${F%.less}.css" ] && rm -fv ${F%.less}.css' \;
