function createCookie(url) {
    return new Promise( (resolve, reject) => {
        req.get(url, (error, response, body) =>{ 
            console.log('cookie created');
            resolve(response); 
        })
    })
};