import { PageConfig, URLExt } from '@jupyterlab/coreutils';
import { ServerConnection } from '@jupyterlab/services';
import { getAlgorithmMetadata } from '../utils/ogc_parsers';

/**
 * Call the API extension
 *
 * @param endPoint API REST end point for the extension
 * @param init Initial values for the request
 * @returns The response body interpreted as JSON
 */
export async function requestAPI<T>(
  endPoint = '',
  init: RequestInit = {}
): Promise<T> {
  // Make request to Jupyter API
  const settings = ServerConnection.makeSettings();
  const requestUrl = URLExt.join(
    settings.baseUrl,
    'jupyter-server-extension', // API Namespace
    endPoint
  );

  let response: Response;
  try {
    response = await ServerConnection.makeRequest(requestUrl, init, settings);
  } catch (error) {
    throw new ServerConnection.NetworkError(error);
  }

  let data: any = await response.text();

  if (data.length > 0) {
    try {
      data = JSON.parse(data);
    } catch (error) {
      console.log('Not a JSON response body.', response);
    }
  }

  if (!response.ok) {
    throw new ServerConnection.ResponseError(response, data.message || data);
  }

  return data;
}



export async function getJobs(username:string) {
  console.log("mlucas: in async jobs function")
  var requestUrl = new URL(PageConfig.getBaseUrl() + 'jupyter-server-extension/listJobs');
  console.log(requestUrl.href)
  
  requestUrl.searchParams.append("username", username);
  requestUrl.searchParams.append("proxy-ticket", "");

  let response : any = await fetch(requestUrl.href, {
    headers: {
      'Content-Type': 'application/json'
    }
  })


  if (response.status >= 200 && response.status < 400) {
    console.log("request went well")
  }else{
    //let res = response.json()
    console.log("something went wrong with request!!!")
    //console.log(response.json())
  }

  return response.json();
}

const filterOptions = (options, inputValue) => {
  const candidate = inputValue.toLowerCase();
  return options.filter(({ label }) => label.toLowerCase().includes(candidate));
};

export async function getAlgorithms( inputValue, callback ) {
  let algorithms_tmp: any[] = []
  var requestUrl = new URL(PageConfig.getBaseUrl() + 'jupyter-server-extension/listAlgorithms');
  //console.log(requestUrl)

  requestUrl.searchParams.append("visibility", "all");

  await fetch(requestUrl.href, {
      headers: {
          'Content-Type': 'application/json'
      }
  }).then((response) => response.json())
      .then((data) => {
          console.log(data)

          data["response"]["algorithms"].forEach((item: any) => {
              let algorithm: any = {}
              algorithm["value"] = item["type"] + ':' + item["version"]
              algorithm["label"] = item["type"] + ':' + item["version"]
              algorithms_tmp.push(algorithm)
          })
          const filtered = filterOptions(algorithms_tmp, inputValue);
          callback(filtered);
          return algorithms_tmp
      });
  return algorithms_tmp
}

export async function describeAlgorithms(algo_id: string) {
  var requestUrl = new URL(PageConfig.getBaseUrl() + 'jupyter-server-extension/describeAlgorithms');
  var body: any = {}

  requestUrl.searchParams.append("algo_id", algo_id);

  await fetch(requestUrl.href, {
    headers: { 'Content-Type': 'application/json' }
  }).then((response) => response.json())
    .then((data) => {
      //console.log(data)
      body = getAlgorithmMetadata(data["response"])
      console.log(body)
      return body
    })
  return body
}

export async function getJobStatus(job_id:string) {
  var requestUrl = new URL(PageConfig.getBaseUrl() + 'jupyter-server-extension/getJobStatus');
  requestUrl.searchParams.append("job_id", job_id);
  let response : any = await fetch(requestUrl.href, {
    headers: {
      'Content-Type': 'application/json'
    }
  })

  let body = ""
  if (response.status >= 200 && response.status < 400) {
    console.log("Query submitted for: ", job_id)
    body = response.json()
    console.log(body)
  }else{
    console.log("something went wrong with request!!!")
  }

  return body;

}


export async function getCMRCollections() {
  var requestUrl = new URL(PageConfig.getBaseUrl() + 'jupyter-server-extension/getCMRCollections');
  var collections: any[] = []
  await fetch(requestUrl.href, {
    headers: {
      'Content-Type': 'application/json'
    }
  }).then((response) => response.json())
    .then((data) => {
      console.log(data)
      data["response"].forEach((item: any) => {
        let collection: any = {}
        collection["value"] = item["Collection"]["ShortName"]
        collection["label"] = item["Collection"]["ShortName"]
        collection["ShortName"] = item["Collection"]["ShortName"]
        collection["ScienceKeywords"] = item["Collection"]["ScienceKeywords"]
        collection["Description"] = item["Collection"]["Description"]
        collection["concept-id"] = item["concept-id"]
        collections.push(collection)
      });
      return collections
    });
  return collections
}

export async function submitJob(data:any) {
  console.log("Job submission data:")
  console.log(data)
  var requestUrl = new URL(PageConfig.getBaseUrl() + 'jupyter-server-extension/submitJob');
  Object.keys(data).map((key, index) => ( 
    requestUrl.searchParams.append(key, data[key])
  ))
  console.log("Request url: ", requestUrl)
  // print request url and test it out on postman to make sure it works
  let response : any = await fetch(requestUrl.href, {
    headers: {
      'Content-Type': 'application/json'
    }
  })

  var body = response.json()
  if (response.status >= 200 && response.status < 400) {
    console.log("job submitted")
  }else{
    console.log("something went wrong with job submission request!!!")
  }

  return body;

}


export async function getResources( inputValue, callback ) {
  var resources: any[] = []
  var requestUrl = new URL(PageConfig.getBaseUrl() + 'jupyter-server-extension/getQueues');
  await fetch(requestUrl.href, {
    headers: {
      'Content-Type': 'application/json'
    }
  }).then((response) => response.json())
    .then((data) => {

      data["response"].forEach((item: any) => {
        let resource: any = {}
        resource["value"] = item
        resource["label"] = item
        resources.push(resource)
      })
      const filtered = filterOptions(resources, inputValue);
      callback(filtered);
      return resources
    });
  return resources
}

export async function getJobResult(job_id:any) {
  var requestUrl = new URL(PageConfig.getBaseUrl() + 'jupyter-server-extension/getJobResult');
  requestUrl.searchParams.append("job_id", job_id);
  console.log("Request url for get result: ", requestUrl)
  // print request url and test it out on postman to make sure it works
  let response : any = await fetch(requestUrl.href, {
    headers: {
      'Content-Type': 'application/json'
    }
  })

  var body = response.json()
  if (response.status >= 200 && response.status < 400) {
    console.log("got job result")
  }else{
    console.log("something went wrong with job result request!!!")
  }

  return body;

}


export async function getJobMetrics(job_id:any) {
  var requestUrl = new URL(PageConfig.getBaseUrl() + 'jupyter-server-extension/getJobMetrics');
  requestUrl.searchParams.append("job_id", job_id);
  console.log("Request url for get result: ", requestUrl)
  // print request url and test it out on postman to make sure it works
  let response : any = await fetch(requestUrl.href, {
    headers: {
      'Content-Type': 'application/json'
    }
  })

  var body = response.json()
  if (response.status >= 200 && response.status < 400) {
    console.log("got job result")
  }else{
    console.log("something went wrong with job metrics request!!!")
  }

  return body;

}


export async function getUserJobs(username:any) {
  var requestUrl = new URL(PageConfig.getBaseUrl() + 'jupyter-server-extension/listUserJobs');
  requestUrl.searchParams.append("username", username);
  console.log("Request url: ", requestUrl)
  // print request url and test it out on postman to make sure it works
  let response : any = await fetch(requestUrl.href, {
    headers: {
      'Content-Type': 'application/json'
    }
  })

  var body = response.json()
  if (response.status >= 200 && response.status < 400) {
    console.log("got user jobs")
  }else{
    console.log("something went wrong with user jobs list request!!!")
  }

  return body;

}

export async function getEnvironmentInfo() {
  var requestUrl = new URL(PageConfig.getBaseUrl() + 'jupyter-server-extension/maapsec/environment');
  console.log("Request url: ", requestUrl)
  // print request url and test it out on postman to make sure it works
  let response : any = await fetch(requestUrl.href, {
    headers: {
      'Content-Type': 'application/json'
    }
  })

  var body = response.json()
  if (response.status >= 200 && response.status < 400) {
    console.log("got environment info")
  }else{
    console.log("something went wrong with user jobs list request!!!")
  }

  return body;

}

