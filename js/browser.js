const AZURE_DOMAIN = "https://mdhopendata.blob.core.windows.net/";

function bytesToSize(bytes) {
    var sizes = ['B', 'K', 'M', 'G', 'T', 'P'];
    for (var i = 0; i < sizes.length; i++) {
        if (bytes <= 1024) {
            return bytes + ' ' + sizes[i];
        } else {
            bytes = parseFloat(bytes / 1024).toFixed(2)
        }
    }
    return bytes + ' P';
}

const url = new URL(window.location);
const path = url.searchParams.get('path');
const prefix = path?'&prefix='+path:'';



function createBrowser(elem, container){
    url.searchParams.delete('path');
    let breadcrumbs = '<div class="breadcrumbs"><a href="'+url.href+'">'+container+'</a> / ';
    if(path){
        currentPath = ""
        path.split("/").filter(s => s).forEach(dir => {
            currentPath += dir+"/";
            url.searchParams.set('path', currentPath);
            breadcrumbs += ' <a href="'+url.href+'">'+dir+'</a> / ';
        });
    }
    breadcrumbs += "</div>";

    elem.innerHTML = breadcrumbs + "  <table id=\"directories\">\n"
        +"   <tr><th>Verzeichnisse</th></tr>\n"
        +"  </table>\n"
        +"  <table id=\"files\">\n"
        +"   <tr><th>Name</th><th>Beschreibung</th><th>Zuletzt bearbeitet</th><th>Größe</th></tr>\n"
        +"  </table>";

    const directory_table = document.getElementById("directories");
    const file_table = document.getElementById("files");
    const options = { month: "2-digit", day: "2-digit", year: "numeric", hour:"2-digit", minute:"2-digit"};
    const dateFormat = new Intl.DateTimeFormat("de-DE", options);


    if(path){
        let idx = path.lastIndexOf('/', path.length-2);
        if(idx > -1){
            let parent = path.substring(0, idx+1)
            url.searchParams.set('path', parent);
        } else {
            url.searchParams.delete('path');
        }
        let row = '<tr><td><a href="'+url.href+'">../</a></td></tr>';

        directory_table.tBodies[0].innerHTML += row;
    }

    fetch(AZURE_DOMAIN+container+"/?restype=container&comp=list&include=metadata"+prefix)
        .then(response => response.text())
        .then(str => new window.DOMParser().parseFromString(str, "text/xml"))
        .then(dom => {
            let blobs = dom.evaluate( '/EnumerationResults/Blobs/Blob' ,dom, null, XPathResult.ANY_TYPE, null )
            let dirs = [];
            while(blob = blobs.iterateNext()){
                let name = dom.evaluate( './Name' ,blob, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null ).singleNodeValue.textContent.trim();
                if(path) name = name.substring(path.length)
                let idx = name.indexOf('/');
                if(idx > -1){
                    let dir = name.substring(0,idx+1);
                    if(dirs.indexOf(dir) == -1){
                        let new_path = (path?path:'')+dir;
                        url.searchParams.set('path', new_path);

                        let row = '<tr><td><a href="'+url.href+'">'+dir+'</a></td></tr>';
                        directory_table.tBodies[0].innerHTML += row;

                        dirs.push(dir);
                    }
                }
            }

            if(!path && dirs.length == 0){
                file_table.hidden = true;
            }

            let hasFiles = false;
            blobs = dom.evaluate( '/EnumerationResults/Blobs/Blob' ,dom, null, XPathResult.ANY_TYPE, null )
            while(blob = blobs.iterateNext()){
                let name = dom.evaluate( './Name' ,blob, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null ).singleNodeValue.textContent.trim();
                if(path) name = name.substring(path.length)
                let idx = name.indexOf('/');
                if(idx == -1){
                    hasFiles = true;
                    let url = dom.evaluate( './Url' ,blob, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null ).singleNodeValue.textContent.trim();
                    let bytes = dom.evaluate( './Properties/Content-Length' ,blob, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null ).singleNodeValue.textContent.trim();
                    let modified = new Date(dom.evaluate( './Properties/Last-Modified' ,blob, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null ).singleNodeValue.textContent.trim());
                    let descriptionDom = dom.evaluate( './Metadata/description' ,blob, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null ).singleNodeValue
                    let description = descriptionDom? descriptionDom.textContent.trim():'';
                    let row = '<tr><td><a href="'+url+'">'+name+'</a></td><td>'+description+'</td><td align="right">'+dateFormat.format(modified)+'</td><td align="right">'+bytesToSize(bytes)+'</td></tr>';

                    file_table.tBodies[0].innerHTML += row;
                }
            }
            if(!hasFiles){
                file_table.hidden = true;
            }
        });
}
