const fs = require('fs');
const express = require('express');
const svgExport = require('svgexport');
const fileUpload = require("express-fileupload")
const {route} = require("express/lib/router");
const router = express.Router();

router.use(fileUpload({useTempFiles: true}))
router.get("/", (req, res, next)=>{
    res.send("Welcome to app svg-png convert. please attached the svg file to field 'upload' with multipart/form-data. add header 'X-SCALE-TO' for other scale factor other then 3")
})
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
        await svgExport.render({
            input: fileSource,
            output: [`${fileDest} ${scale}x`],
        }, async ()=>{
            const fileStack = fileDest.replace("\\","/").split("/")
            let deleteFile = (file)=>{fs.unlink(file, (err)=>err?console.log(err.toString()):console.warn(`${fs} deleted`))}
            await res.download(fileDest, fileStack[fileStack.length-1], (err)=>{
                deleteFile(fileSource)
                deleteFile(fileDest)
                if(err){
                    console.log(err)
                    return res.status(500).send(`${err.toString()}`)
                }
            })
        })
    }

    await process(req.files.upload)
})

module.exports = router;
