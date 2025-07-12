export default function cleanData (response,category){

    if(category == 'noError'){
    const cleanData = response.data.replace(/<!--.*?-->/g, "").trim();
    const jsonData = JSON.parse(cleanData);
    return jsonData
    }else if(category == 'Error'){
      const cleanData = response.response.data.replace(/<!--.*?-->/g, "").trim();
      const jsonData = JSON.parse(cleanData);
      return jsonData
    }
     

}