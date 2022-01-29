var fs = require('fs');
var express = require('express');
var svgexport = require('svgexport')
const fileUpload = require("express-fileupload")
var router = express.Router();

/* GET users listing. */
// router.get('/', function(req, res, next) {
//     res.send("hihi")
// });

router.use(fileUpload({useTempFiles: true}))
router.post("/", async function (req, res, next){
    console.log(req.header("content-type"))
    // console.log(req)
    if(!req.files || Object.keys(req.files).length === 0){
        return res.status(400).send("No files were uploaded.")
    }

    if(!req.files.upload){
        return res.status(400).send("No \"upload\" is attached")
    }

    const scaleStr = req.header("X-SCALE-TO")
    if(scaleStr){
        try{
            if(parseInt(scaleStr)<0 || parseInt(scaleStr)>15){
                return res.status(400).send("Scale not set correctly[excess limit]")
            }
        } catch (e){
            return res.status(400).send("Scale not set correctly[fail parse]")
        }
    }

    const scale = scaleStr ? parseInt(scaleStr) : 3

    let process= async function(file) {
        const fileSource = file.tempFilePath+".svg"
        const fileDest = file.tempFilePath+".png"
        await file.mv(fileSource)

        console.log(`${fileDest} ${scale}x`)
        await svgexport.render({
            input: fileSource,
            output: [`${fileDest} ${scale}x`],
        }, async ()=>{
            const fileStack = fileDest.replace("\\","/").split("/")
            await res.download(fileDest, fileStack[fileStack.length-1], (err)=>{
                if(err){
                    console.log(err)
                } else {
                    let deleteFile = (file)=>{fs.unlink(file, (err)=>err?console.log(err.toString()):console.warn(`${fs} deleted`))}
                    deleteFile(fileSource)
                    deleteFile(fileDest)
                }
            })
        })
    }

    await process(req.files.upload)
})

module.exports = router;
