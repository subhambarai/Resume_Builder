function hide()
{
    var fill = document.getElementById("fill");
    var sidebar = document.getElementById("sidebar");
    var fill = document.getElementById("fill");
    var main_content = document.getElementById("main-content");
    var sidebar_content = document.getElementById("sidebar-content");
    var hideclass = document.getElementsByClassName("hide-content");
    if(fill.style.display == "none")
    {
        sidebar.style.width = "21%";
        fill.style.display = "block";
        main_content.style.width = "79%";
        sidebar_content.style.marginRight = "10px";
        sidebar_content.style.marginLeft = "10px"; 
        for(let i=0;i<hideclass.length;i++)
        {
            hideclass[i].style.display = "inline";
        }
    }
    else
    {
        sidebar.style.width = "5%";
        fill.style.display = "none";
        main_content.style.width = "95%";
        sidebar_content.style.marginRight = "0";
        sidebar_content.style.marginLeft = "0px"; 
        for(let i=0;i<hideclass.length;i++)
        {
            hideclass[i].style.display = "none";
        }
    }  
}


    var path = '/'+window.location.pathname.split('/').pop();
    var target = document.getElementsByClassName('link');
    for(let i=0;i<target.length;i++)
    {
        if(target[i].getAttribute("href") == path)
        {
             target[i].querySelector('.side-elements').classList.add('active');
        }
    }
   