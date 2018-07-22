class GameCard
{
    constructor(name, tag, imageSrc, color="primary")
    {
        this.name = name;
        this.tag = tag;
        this.imageSrc = imageSrc;
        this.color = color;
    }

    get html()
    {
        var button = this.cardButton;
        button.appendChild(this.cardTitle);
        button.appendChild(this.cardImage);
        return button;
    }

    get cardButton()
    {
        var div = document.createElement("div");
        div.className = "card bg-smooth btn btn-primary port-btn bg-" + this.color;
        div.setAttribute("role","button");
        div.id=this.tag+"-btn";
        return div;
    }

    get cardTitle()
    {
        var div = document.createElement("div");
        div.className = "card-header text-center";
        div.id=this.tag+"-hdr";
        div.innerText=this.name;
        return div;
    }

    get cardImage()
    {
        var img = document.createElement("img");
        img.id=this.tag+"-img";
        img.className="card-img-top";
        img.src=this.imageSrc;
        img.alt=this.name+" Image";
        return img;
    }
}

class PanelSection
{
    constructor(name,id, className, active=false, type="div", contents="Who knows?")
    {
        this.name = name;
        this.id = id;
        this.className = className;
        this.active=active;
        this.type=type;
        this.contents = contents;
    }

    get navTab()
    {
        let navItem = document.createElement("li");
        navItem.className="nav-item";
        let itemInner = document.createElement("a");
            itemInner.className= this.active? "nav-link active" : "nav-link";
            itemInner.setAttribute("data-toggle","tab");
            itemInner.setAttribute("href", "#"+this.id);
            itemInner.innerText=this.name;
        navItem.appendChild(itemInner);
        
        return navItem;
    }

    get tabPane()
    {
        let pane = document.createElement("div");
            pane.id=this.id;
            pane.className= this.active? "tab-pane"+ " active" : "tab-pane";
            if(this.type=="ul")
            {
                pane.appendChild(this.generateList());
            }
            else if(this.type=="p")
            {
                pane.appendChild(this.generateParagraphs());
            }
            else
            {
                pane.innerHTML=this.contents;
            }
        return pane;
    }

    generateList()
    {
        let listContents = document.createElement("ul");
        listContents.className = this.className;
        this.contents.forEach(function(value){
            let listItem = document.createElement("li");
                listItem.className="list-group-item";
                listItem.innerText=value;
            listContents.appendChild(listItem);
        });

        return listContents;
    }

    generateParagraphs()
    {
        let listContents = document.createElement("div");
            listContents.className = this.className;
        this.contents.forEach(function(value){
            let listItem = document.createElement("p");
                listItem.innerHTML=value;
            listContents.appendChild(listItem);
        });

        return listContents;
    }
}

class GameInfo
{
    constructor(name, tag, year, images, sections, color="primary")
    {
        this.name = name;
        this.tag = tag;
        this.year = year;
        this.images = images;
        this.sections = sections;
        this.color = color;
    }

    get card()
    {
        return new GameCard(this.name,this.tag,this.images[0], this.color);
    }

    get panel()
    {
        let pan = document.createElement("div");
        pan.className = "container-fluid";
        pan.appendChild(this.navBar);
        pan.appendChild(this.panelBody);
        return pan;
    }

    get navBar()
    {
        let nav = document.createElement("ul");
        nav.className="nav nav-tabs";
        let brand = document.createElement("li");
        brand.className="navbar-brand";
        brand.innerText=this.name;
        nav.appendChild(brand);
        
        this.sections.forEach(function(value){
            nav.appendChild(value.navTab);
        });


        return nav;
    }

    get panelBody()
    {
        let row = document.createElement("div");
            row.className = "row";
        let colCard = document.createElement("div");
            colCard.className = "col-4 card";
        let body = document.createElement("div");
            body.className="card-body tab-content";
        
            this.sections.forEach(function(value){
            body.appendChild(value.tabPane);
        });
        colCard.appendChild(body);
        row.appendChild(colCard);

        let carCol = document.createElement("div");
            carCol.className="col-8";
            carCol.appendChild(this.panelCarousel);

        row.appendChild(carCol);
    
        return row;
    }

    get panelCarousel()
    {
        let colCarousel = document.createElement("div");
            colCarousel.id="panelCarousel";
            colCarousel.className="carousel slide";
            colCarousel.setAttribute("data-ride","carousel");
        
        let carouselInner = document.createElement("div");
            carouselInner.className="carousel-inner";
            carouselInner.setAttribute("role","listbox");

            this.images.forEach(function(imgSrc,index){
                let carImg = document.createElement("div");
                    carImg.className= index==0 ? "carousel-item active" : "carousel-item";
                let img = document.createElement("img");
                    //img.id=this.tag+"-img-"+index;
                    img.className="d-block w-100";
                    img.src=imgSrc;
                    //img.alt=this.name+" Image "+index;
                carImg.appendChild(img);
                carouselInner.appendChild(carImg);
            });
        colCarousel.appendChild(carouselInner);
        return colCarousel;
    }
}