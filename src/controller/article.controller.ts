import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();

  var match = false;

  exports.getSpotArticles = async (req:any, res:any) => {

    let id = req.params.id
    let endDate = req.query.endDate
    let startDate = req.query.startDate
    let limit = Number(req.query.limit)

    try {
     
      const response: any = await prisma.$queryRaw`
        SELECT 
        spot_id::text,
        url,
        name,
        title,
        author,
        content,                  
        image_url,
        description,
        published_at,
        id::text FROM "Article" WHERE spot_id::text = ${id} AND published_at::text BETWEEN ${startDate} AND ${endDate} FETCH FIRST ${limit} ROWS ONLY` as any;

      return res.status(200).json({
        success: true,
        articles: response
      })

    } catch (e) {

      res.status(400).json({
        error: e
      })

    }

  }

  exports.getArticles = async (req:any, res:any) => {

    let startDate = req.query.startDate
    let endDate = req.query.endDate
    let limit = Number(req.query.limit)

    try {
     
      const response: any = await prisma.$queryRaw`
        SELECT 
        spot_id::text,
        url,
        name,
        title,
        author,
        content,                  
        image_url,
        description,
        published_at,
        id::text FROM "Article" FETCH FIRST ${limit} ROWS ONLY` as any;

      return res.status(200).json({
        success: true,
        articles: response
      })

    } catch (e) {

      res.status(400).json({
        error: e
      })

    }

  }

  exports.getArticle = async (req:any, res:any) => {

    let id = req.params.id

    try {
     
      const response: any = await prisma.$queryRaw`
      SELECT
      spot_id::text,
      url,
      name,
      title,
      author,
      content,                  
      image_url,
      description,
      published_at,
      id::text FROM "Article" WHERE id::text = ${id}` as any;

      return res.status(200).json({
        success: true,
        articles: response
      })

    } catch (e) {

      res.status(400).json({
        error: e
      })

    }

  }
  
  exports.postArticle = async (req:any, res:any) => {

    const { 
      spot_id,
      url,
      name,
      title,
      author,
      content,                  
      image_url,
      description,
      published_at
     } = req.body

      const articles:any = await prisma.$queryRaw`
      SELECT 
      id::text, 
      title::text
      FROM "Article"` as any;
 
      articles?.forEach((article:any) => {

          if(article?.spot_id == spot_id && article?.title == title){
            match = true
          } else {
            match = false
          }

      })

      if(match){

        res.status(400).json({
          "message": "article already exists"
        })   

      } else if(!match) {

        try {

          const response: any = await prisma.$queryRaw`
          insert into "Article" 
          (
            "spot_id,"
            "url",
            "name",
            "title",
            "author",
            "content",                  
            "image_url",
            "description",
            "published_at"
          ) values
          (
            ${spot_id}::uuid,
            ${url},
            ${name},
            ${title},
            ${author},
            ${content},                  
            ${image_url},
            ${description},
            ${published_at}
          )
          returning id` as any;

          res.status(200).json({
            success: true,
            id: response[0].id
          })
          
        } catch (e) {
          res.status(400).json({
            error: e
          })

        }
      }

  }

  exports.updateArticle = async (req:any, res:any) => {

    let id = req.params.id

    try {
     
      const response: any = await prisma.$queryRaw`
      UPDATE
      spot_id, 
      url,
      name,
      title,
      author,
      content,                  
      image_url,
      description,
      published_at FROM "Article" WHERE id::text = ${id}` as any;

      return res.status(200).json({
        success: true,
        articles: response
      })

    } catch (e) {

      res.status(400).json({
        error: e
      })

    }

  }

  exports.deleteArticle = async (req:any, res:any) => {

    let id = req.params.id

    try {
     
     const response: any = await prisma.$queryRaw`
     DELETE FROM "Article" 
     WHERE 
     id::text = ${id} 
     RETURNING id::text` as any;

      if(response[0]?.id){
     
        return res.status(200).json({
          success: true,
          message: 'article deleted'
        })

      } else {
             
          return res.status(401).json({
          success: true,
          message: 'article not found'
        })

      }
 
    } catch (e) {

      res.status(400).json({
        error: e
      })

    }

  }

  exports.bulkPostArticle = async (req:any, res:any) => {

    let id = req.params.id

    var uploadArticles = []
    
    uploadArticles = req.body

    if(uploadArticles.length > 0){
      
      uploadArticles.forEach((article:any) => {
        article['spot_id'] = id;
        article['published_at'] = article.publishedAt;
        article['image_url'] = article.urlToImage
        article['name'] = article.source.name
        if(article.author == null){
          article.author = ""
        }
        delete article.urlToImage
        delete article.publishedAt
        delete article.source
      });
      console.log(uploadArticles)
      try {

        const response: any = await prisma.article.createMany({
          data: uploadArticles,
          skipDuplicates: true
        })

        res.status(200).json({
          success: true,
          message: "articles saved",
          total: response
        })

      } catch (e) {
        res.status(400).json({
          error: e
        })
      }
    } else {
      res.status(400).json({
        error: 'bad request'
      })
    }

  }

  


  

  

