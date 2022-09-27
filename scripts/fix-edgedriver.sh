#!/bin/bash

cd node_modules/msedgedriver

tr -d '\015' <bin/msedgedriver >tmp
mv tmp bin/msedgedriver

chmod +x bin/msedgedriver

EDGECHROMIUMDRIVER_VERSION=LATEST node install
