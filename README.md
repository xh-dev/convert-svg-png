```shell
docker pull xethhung/convert-svg-png:1.0.0
```

```shell
curl -X POST -w "\n%{http_code} -F upload=@svgFile.svg https://convert-svg-png.mytools.express -o svgFile.png"
```