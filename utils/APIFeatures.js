class APIFeatures{
    constructor(query, queryString)
    {
     
        this.query=query;
        this.queryString=queryString;
    }
    filter(){
      
        const queryobj={...this.queryString};
        const excludedfields=['page','sort','limit','fields'];
        excludedfields.forEach(el=>delete queryobj[el]);
        //1b Advance filtering
        let querStr=JSON.stringify(queryobj);
        querStr=querStr.replace(/\b(gte|gt|lte|lt)\b/g,match=>`$${match}`);
        //aese issliye kra cause we have to use sorting,pagination,limit etc aage uske liye if pehle sey await lgaaliya
        //toh pehle sey sb save hojaaye ga aur aage ka kch nai lgaa paayein ge
        this.query=this.query.find(JSON.parse(querStr));
        return this;
    }
    sort(){
        if(this.queryString.sort){
            const sortBy=this.queryString.sort.split(',').join('  ');
            this.query=this.query.sort(sortBy);
           }
           else{
              this.query= this.query.sort('-createdAt');
           }
           return this;
    }
    limit(){
       
        if(this.queryString.fields){
            const fields=this.queryString.fields.split(',').join(' ');
            this.query=this.query.select(fields);
        }
        else{
            this.query=this.query.select('-__v');
        } 
        return this;
    }
    pagination(){
       
        const page = this.queryString.page*1||1;
        const limit = this.queryString.limit*1||100;
        const skip= (page-1)*limit;
    
        this.query=this.query.skip(skip).limit(limit);
        return this;
    }
};

module.exports= APIFeatures;