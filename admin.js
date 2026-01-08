function generate(){
  const obj={
    id:document.getElementById("title").value.toLowerCase().replace(/\s+/g,"-"),
    title:document.getElementById("title").value,
    category:document.getElementById("category").value,
    qty:+document.getElementById("qty").value,
    condition:document.getElementById("condition").value,
    price:+document.getElementById("price").value,
    location:document.getElementById("location").value,
    description:document.getElementById("desc").value,
    photos:[],
    datePosted:new Date().toISOString().split("T")[0],
    status:"Available"
  };
  document.getElementById("out").textContent=JSON.stringify(obj,null,2);
}
