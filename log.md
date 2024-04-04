

# Axios 1.6.0 not compatible with Node v16
- you see error "Uncaught TypeError: axios_1.default is undefined" in your react app
- downgraded package to 1.1.0 to fix
- (alternatively, could use Node v14)
https://github.com/axios/axios/issues/5174

# Axios 1.1.0 seems to not be working with formdata
- eg https://github.com/deepai-org/deepai-js-client/issues/40
- attempted fix by upgrading to 1.4.0, according to: https://github.com/deepai-org/deepai-js-client/issues/40
- caused the "Uncaught TypeError: axios_1.default is undefined" to return