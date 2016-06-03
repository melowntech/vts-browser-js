Melown.Presentation.prototype.Utils.readTextFile = function(file) {
    var rawFile = new XMLHttpRequest();
    rawFile.open("GET", file, false);
    rawFile.onreadystatechange = function ()
    {
        if(rawFile.readyState === 4)
        {
            if(rawFile.status === 200 || rawFile.status == 0)
            {
                var allText = rawFile.responseText;
                this.file = allText;
            }
        }
    }
    rawFile.send(null);    
}