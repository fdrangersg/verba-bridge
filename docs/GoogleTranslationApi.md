# Cloud Translation API

Integrates text translation into your website or application.

- [REST Resource: v3beta1.projects](https://docs.cloud.google.com/translate/docs/reference/rest#v3beta1.projects)
- [REST Resource: v3beta1.projects.locations](https://docs.cloud.google.com/translate/docs/reference/rest#v3beta1.projects.locations)
- [REST Resource: v3beta1.projects.locations.glossaries](https://docs.cloud.google.com/translate/docs/reference/rest#v3beta1.projects.locations.glossaries)
- [REST Resource: v3beta1.projects.locations.operations](https://docs.cloud.google.com/translate/docs/reference/rest#v3beta1.projects.locations.operations)
- [REST Resource: v3.projects](https://docs.cloud.google.com/translate/docs/reference/rest#v3.projects)
- [REST Resource: v3.projects.locations](https://docs.cloud.google.com/translate/docs/reference/rest#v3.projects.locations)
- [REST Resource: v3.projects.locations.adaptiveMtDatasets](https://docs.cloud.google.com/translate/docs/reference/rest#v3.projects.locations.adaptiveMtDatasets)
- [REST Resource: v3.projects.locations.adaptiveMtDatasets.adaptiveMtFiles](https://docs.cloud.google.com/translate/docs/reference/rest#v3.projects.locations.adaptiveMtDatasets.adaptiveMtFiles)
- [REST Resource:
  v3.projects.locations.adaptiveMtDatasets.adaptiveMtFiles.adaptiveMtSentences](https://docs.cloud.google.com/translate/docs/reference/rest#v3.projects.locations.adaptiveMtDatasets.adaptiveMtFiles.adaptiveMtSentences)
- [REST Resource: v3.projects.locations.adaptiveMtDatasets.adaptiveMtSentences](https://docs.cloud.google.com/translate/docs/reference/rest#v3.projects.locations.adaptiveMtDatasets.adaptiveMtSentences)
- [REST Resource: v3.projects.locations.datasets](https://docs.cloud.google.com/translate/docs/reference/rest#v3.projects.locations.datasets)
- [REST Resource: v3.projects.locations.datasets.examples](https://docs.cloud.google.com/translate/docs/reference/rest#v3.projects.locations.datasets.examples)
- [REST Resource: v3.projects.locations.glossaries](https://docs.cloud.google.com/translate/docs/reference/rest#v3.projects.locations.glossaries)
- [REST Resource: v3.projects.locations.glossaries.glossaryEntries](https://docs.cloud.google.com/translate/docs/reference/rest#v3.projects.locations.glossaries.glossaryEntries)
- [REST Resource: v3.projects.locations.models](https://docs.cloud.google.com/translate/docs/reference/rest#v3.projects.locations.models)
- [REST Resource: v3.projects.locations.operations](https://docs.cloud.google.com/translate/docs/reference/rest#v3.projects.locations.operations)

## Service: translate.googleapis.com

To call this service, we recommend that you use the Google-provided [client libraries](https://cloud.google.com/apis/docs/client-libraries-explained). If your application needs to use your own libraries to call this service, use the following information when you make the API requests.

### Discovery document

A [Discovery Document](https://developers.google.com/discovery/v1/reference/apis) is a machine-readable specification for describing and consuming REST APIs. It is used to build client libraries, IDE plugins, and other tools that interact with Google APIs. One service may provide multiple discovery documents. This service provides the following discovery documents:

- <https://translate.googleapis.com/$discovery/rest?version=v3>
- <https://translate.googleapis.com/$discovery/rest?version=v3beta1>

### Service endpoint

A [service endpoint](https://cloud.google.com/apis/design/glossary#api_service_endpoint) is a base URL that specifies the network address of an API service. One service might have multiple service endpoints. This service has the following service endpoint and all URIs below are relative to this service endpoint:

- `https://translate.googleapis.com`

## REST Resource: [v3beta1.projects](https://docs.cloud.google.com/translate/docs/reference/rest/v3beta1/projects)

| Methods ||
|---|---|
| `https://docs.cloud.google.com/translate/docs/reference/rest/v3beta1/projects/detectLanguage` | `POST /v3beta1/{parent=projects/*}:detectLanguage` Detects the language of text within a request. |
| `https://docs.cloud.google.com/translate/docs/reference/rest/v3beta1/projects/getSupportedLanguages` | `GET /v3beta1/{parent=projects/*}/supportedLanguages` Returns a list of supported languages for translation. |
| `https://docs.cloud.google.com/translate/docs/reference/rest/v3beta1/projects/translateText` | `POST /v3beta1/{parent=projects/*}:translateText` Translates input text and returns translated text. |

## REST Resource: [v3beta1.projects.locations](https://docs.cloud.google.com/translate/docs/reference/rest/v3beta1/projects.locations)

| Methods ||
|---|---|
| `https://docs.cloud.google.com/translate/docs/reference/rest/v3beta1/projects.locations/batchTranslateDocument` | `POST /v3beta1/{parent=projects/*/locations/*}:batchTranslateDocument` Translates a large volume of document in asynchronous batch mode. |
| `https://docs.cloud.google.com/translate/docs/reference/rest/v3beta1/projects.locations/batchTranslateText` | `POST /v3beta1/{parent=projects/*/locations/*}:batchTranslateText` Translates a large volume of text in asynchronous batch mode. |
| `https://docs.cloud.google.com/translate/docs/reference/rest/v3beta1/projects.locations/detectLanguage` | `POST /v3beta1/{parent=projects/*/locations/*}:detectLanguage` Detects the language of text within a request. |
| `https://docs.cloud.google.com/translate/docs/reference/rest/v3beta1/projects.locations/get` | `GET /v3beta1/{name=projects/*/locations/*}` Gets information about a location. |
| `https://docs.cloud.google.com/translate/docs/reference/rest/v3beta1/projects.locations/getSupportedLanguages` | `GET /v3beta1/{parent=projects/*/locations/*}/supportedLanguages` Returns a list of supported languages for translation. |
| `https://docs.cloud.google.com/translate/docs/reference/rest/v3beta1/projects.locations/list` | `GET /v3beta1/{name=projects/*}/locations` Lists information about the supported locations for this service. |
| `https://docs.cloud.google.com/translate/docs/reference/rest/v3beta1/projects.locations/translateDocument` | `POST /v3beta1/{parent=projects/*/locations/*}:translateDocument` Translates documents in synchronous mode. |
| `https://docs.cloud.google.com/translate/docs/reference/rest/v3beta1/projects.locations/translateText` | `POST /v3beta1/{parent=projects/*/locations/*}:translateText` Translates input text and returns translated text. |

## REST Resource: [v3beta1.projects.locations.glossaries](https://docs.cloud.google.com/translate/docs/reference/rest/v3beta1/projects.locations.glossaries)

| Methods ||
|---|---|
| `https://docs.cloud.google.com/translate/docs/reference/rest/v3beta1/projects.locations.glossaries/create` | `POST /v3beta1/{parent=projects/*/locations/*}/glossaries` Creates a glossary and returns the long-running operation. |
| `https://docs.cloud.google.com/translate/docs/reference/rest/v3beta1/projects.locations.glossaries/delete` | `DELETE /v3beta1/{name=projects/*/locations/*/glossaries/*}` Deletes a glossary, or cancels glossary construction if the glossary isn't created yet. |
| `https://docs.cloud.google.com/translate/docs/reference/rest/v3beta1/projects.locations.glossaries/get` | `GET /v3beta1/{name=projects/*/locations/*/glossaries/*}` Gets a glossary. |
| `https://docs.cloud.google.com/translate/docs/reference/rest/v3beta1/projects.locations.glossaries/list` | `GET /v3beta1/{parent=projects/*/locations/*}/glossaries` Lists glossaries in a project. |

## REST Resource: [v3beta1.projects.locations.operations](https://docs.cloud.google.com/translate/docs/reference/rest/v3beta1/projects.locations.operations)

| Methods ||
|---|---|
| `https://docs.cloud.google.com/translate/docs/reference/rest/v3beta1/projects.locations.operations/cancel` | `POST /v3beta1/{name=projects/*/locations/*/operations/*}:cancel` Starts asynchronous cancellation on a long-running operation. |
| `https://docs.cloud.google.com/translate/docs/reference/rest/v3beta1/projects.locations.operations/delete` | `DELETE /v3beta1/{name=projects/*/locations/*/operations/*}` Deletes a long-running operation. |
| `https://docs.cloud.google.com/translate/docs/reference/rest/v3beta1/projects.locations.operations/get` | `GET /v3beta1/{name=projects/*/locations/*/operations/*}` Gets the latest state of a long-running operation. |
| `https://docs.cloud.google.com/translate/docs/reference/rest/v3beta1/projects.locations.operations/list` | `GET /v3beta1/{name=projects/*/locations/*}/operations` Lists operations that match the specified filter in the request. |
| `https://docs.cloud.google.com/translate/docs/reference/rest/v3beta1/projects.locations.operations/wait` | `POST /v3beta1/{name=projects/*/locations/*/operations/*}:wait` Waits until the specified long-running operation is done or reaches at most a specified timeout, returning the latest state. |

## REST Resource: [v3.projects](https://docs.cloud.google.com/translate/docs/reference/rest/v3/projects)

| Methods ||
|---|---|
| `https://docs.cloud.google.com/translate/docs/reference/rest/v3/projects/detectLanguage` | `POST /v3/{parent=projects/*}:detectLanguage` Detects the language of text within a request. |
| `https://docs.cloud.google.com/translate/docs/reference/rest/v3/projects/getSupportedLanguages` | `GET /v3/{parent=projects/*}/supportedLanguages` Returns a list of supported languages for translation. |
| `https://docs.cloud.google.com/translate/docs/reference/rest/v3/projects/romanizeText` | `POST /v3/{parent=projects/*}:romanizeText` Romanize input text written in non-Latin scripts to Latin text. |
| `https://docs.cloud.google.com/translate/docs/reference/rest/v3/projects/translateText` | `POST /v3/{parent=projects/*}:translateText` Translates input text and returns translated text. |

## REST Resource: [v3.projects.locations](https://docs.cloud.google.com/translate/docs/reference/rest/v3/projects.locations)

| Methods ||
|---|---|
| `https://docs.cloud.google.com/translate/docs/reference/rest/v3/projects.locations/adaptiveMtTranslate` | `POST /v3/{parent=projects/*/locations/*}:adaptiveMtTranslate` Translate text using Adaptive MT. |
| `https://docs.cloud.google.com/translate/docs/reference/rest/v3/projects.locations/batchTranslateDocument` | `POST /v3/{parent=projects/*/locations/*}:batchTranslateDocument` Translates a large volume of document in asynchronous batch mode. |
| `https://docs.cloud.google.com/translate/docs/reference/rest/v3/projects.locations/batchTranslateText` | `POST /v3/{parent=projects/*/locations/*}:batchTranslateText` Translates a large volume of text in asynchronous batch mode. |
| `https://docs.cloud.google.com/translate/docs/reference/rest/v3/projects.locations/detectLanguage` | `POST /v3/{parent=projects/*/locations/*}:detectLanguage` Detects the language of text within a request. |
| `https://docs.cloud.google.com/translate/docs/reference/rest/v3/projects.locations/get` | `GET /v3/{name=projects/*/locations/*}` Gets information about a location. |
| `https://docs.cloud.google.com/translate/docs/reference/rest/v3/projects.locations/getSupportedLanguages` | `GET /v3/{parent=projects/*/locations/*}/supportedLanguages` Returns a list of supported languages for translation. |
| `https://docs.cloud.google.com/translate/docs/reference/rest/v3/projects.locations/list` | `GET /v3/{name=projects/*}/locations` Lists information about the supported locations for this service. |
| `https://docs.cloud.google.com/translate/docs/reference/rest/v3/projects.locations/romanizeText` | `POST /v3/{parent=projects/*/locations/*}:romanizeText` Romanize input text written in non-Latin scripts to Latin text. |
| `https://docs.cloud.google.com/translate/docs/reference/rest/v3/projects.locations/translateDocument` | `POST /v3/{parent=projects/*/locations/*}:translateDocument` Translates documents in synchronous mode. |
| `https://docs.cloud.google.com/translate/docs/reference/rest/v3/projects.locations/translateText` | `POST /v3/{parent=projects/*/locations/*}:translateText` Translates input text and returns translated text. |

## REST Resource: [v3.projects.locations.adaptiveMtDatasets](https://docs.cloud.google.com/translate/docs/reference/rest/v3/projects.locations.adaptiveMtDatasets)

| Methods ||
|---|---|
| `https://docs.cloud.google.com/translate/docs/reference/rest/v3/projects.locations.adaptiveMtDatasets/create` | `POST /v3/{parent=projects/*/locations/*}/adaptiveMtDatasets` Creates an Adaptive MT dataset. |
| `https://docs.cloud.google.com/translate/docs/reference/rest/v3/projects.locations.adaptiveMtDatasets/delete` | `DELETE /v3/{name=projects/*/locations/*/adaptiveMtDatasets/*}` Deletes an Adaptive MT dataset, including all its entries and associated metadata. |
| `https://docs.cloud.google.com/translate/docs/reference/rest/v3/projects.locations.adaptiveMtDatasets/get` | `GET /v3/{name=projects/*/locations/*/adaptiveMtDatasets/*}` Gets the Adaptive MT dataset. |
| `https://docs.cloud.google.com/translate/docs/reference/rest/v3/projects.locations.adaptiveMtDatasets/importAdaptiveMtFile` | `POST /v3/{parent=projects/*/locations/*/adaptiveMtDatasets/*}:importAdaptiveMtFile` Imports an AdaptiveMtFile and adds all of its sentences into the AdaptiveMtDataset. |
| `https://docs.cloud.google.com/translate/docs/reference/rest/v3/projects.locations.adaptiveMtDatasets/list` | `GET /v3/{parent=projects/*/locations/*}/adaptiveMtDatasets` Lists all Adaptive MT datasets for which the caller has read permission. |

## REST Resource: [v3.projects.locations.adaptiveMtDatasets.adaptiveMtFiles](https://docs.cloud.google.com/translate/docs/reference/rest/v3/projects.locations.adaptiveMtDatasets.adaptiveMtFiles)

| Methods ||
|---|---|
| `https://docs.cloud.google.com/translate/docs/reference/rest/v3/projects.locations.adaptiveMtDatasets.adaptiveMtFiles/delete` | `DELETE /v3/{name=projects/*/locations/*/adaptiveMtDatasets/*/adaptiveMtFiles/*}` Deletes an AdaptiveMtFile along with its sentences. |
| `https://docs.cloud.google.com/translate/docs/reference/rest/v3/projects.locations.adaptiveMtDatasets.adaptiveMtFiles/get` | `GET /v3/{name=projects/*/locations/*/adaptiveMtDatasets/*/adaptiveMtFiles/*}` Gets and AdaptiveMtFile |
| `https://docs.cloud.google.com/translate/docs/reference/rest/v3/projects.locations.adaptiveMtDatasets.adaptiveMtFiles/list` | `GET /v3/{parent=projects/*/locations/*/adaptiveMtDatasets/*}/adaptiveMtFiles` Lists all AdaptiveMtFiles associated to an AdaptiveMtDataset. |

## REST Resource: [v3.projects.locations.adaptiveMtDatasets.adaptiveMtFiles.adaptiveMtSentences](https://docs.cloud.google.com/translate/docs/reference/rest/v3/projects.locations.adaptiveMtDatasets.adaptiveMtFiles.adaptiveMtSentences)

| Methods ||
|---|---|
| `https://docs.cloud.google.com/translate/docs/reference/rest/v3/projects.locations.adaptiveMtDatasets.adaptiveMtFiles.adaptiveMtSentences/list` | `GET /v3/{parent=projects/*/locations/*/adaptiveMtDatasets/*/adaptiveMtFiles/*}/adaptiveMtSentences` Lists all AdaptiveMtSentences under a given file/dataset. |

## REST Resource: [v3.projects.locations.adaptiveMtDatasets.adaptiveMtSentences](https://docs.cloud.google.com/translate/docs/reference/rest/v3/projects.locations.adaptiveMtDatasets.adaptiveMtSentences)

| Methods ||
|---|---|
| `https://docs.cloud.google.com/translate/docs/reference/rest/v3/projects.locations.adaptiveMtDatasets.adaptiveMtSentences/list` | `GET /v3/{parent=projects/*/locations/*/adaptiveMtDatasets/*}/adaptiveMtSentences` Lists all AdaptiveMtSentences under a given file/dataset. |

## REST Resource: [v3.projects.locations.datasets](https://docs.cloud.google.com/translate/docs/reference/rest/v3/projects.locations.datasets)

| Methods ||
|---|---|
| `https://docs.cloud.google.com/translate/docs/reference/rest/v3/projects.locations.datasets/create` | `POST /v3/{parent=projects/*/locations/*}/datasets` Creates a Dataset. |
| `https://docs.cloud.google.com/translate/docs/reference/rest/v3/projects.locations.datasets/delete` | `DELETE /v3/{name=projects/*/locations/*/datasets/*}` Deletes a dataset and all of its contents. |
| `https://docs.cloud.google.com/translate/docs/reference/rest/v3/projects.locations.datasets/exportData` | `POST /v3/{dataset=projects/*/locations/*/datasets/*}:exportData` Exports dataset's data to the provided output location. |
| `https://docs.cloud.google.com/translate/docs/reference/rest/v3/projects.locations.datasets/get` | `GET /v3/{name=projects/*/locations/*/datasets/*}` Gets a Dataset. |
| `https://docs.cloud.google.com/translate/docs/reference/rest/v3/projects.locations.datasets/importData` | `POST /v3/{dataset=projects/*/locations/*/datasets/*}:importData` Import sentence pairs into translation Dataset. |
| `https://docs.cloud.google.com/translate/docs/reference/rest/v3/projects.locations.datasets/list` | `GET /v3/{parent=projects/*/locations/*}/datasets` Lists datasets. |

## REST Resource: [v3.projects.locations.datasets.examples](https://docs.cloud.google.com/translate/docs/reference/rest/v3/projects.locations.datasets.examples)

| Methods ||
|---|---|
| `https://docs.cloud.google.com/translate/docs/reference/rest/v3/projects.locations.datasets.examples/list` | `GET /v3/{parent=projects/*/locations/*/datasets/*}/examples` Lists sentence pairs in the dataset. |

## REST Resource: [v3.projects.locations.glossaries](https://docs.cloud.google.com/translate/docs/reference/rest/v3/projects.locations.glossaries)

| Methods ||
|---|---|
| `https://docs.cloud.google.com/translate/docs/reference/rest/v3/projects.locations.glossaries/create` | `POST /v3/{parent=projects/*/locations/*}/glossaries` Creates a glossary and returns the long-running operation. |
| `https://docs.cloud.google.com/translate/docs/reference/rest/v3/projects.locations.glossaries/delete` | `DELETE /v3/{name=projects/*/locations/*/glossaries/*}` Deletes a glossary, or cancels glossary construction if the glossary isn't created yet. |
| `https://docs.cloud.google.com/translate/docs/reference/rest/v3/projects.locations.glossaries/get` | `GET /v3/{name=projects/*/locations/*/glossaries/*}` Gets a glossary. |
| `https://docs.cloud.google.com/translate/docs/reference/rest/v3/projects.locations.glossaries/list` | `GET /v3/{parent=projects/*/locations/*}/glossaries` Lists glossaries in a project. |
| `https://docs.cloud.google.com/translate/docs/reference/rest/v3/projects.locations.glossaries/patch` | `PATCH /v3/{glossary.name=projects/*/locations/*/glossaries/*}` Updates a glossary. |

## REST Resource: [v3.projects.locations.glossaries.glossaryEntries](https://docs.cloud.google.com/translate/docs/reference/rest/v3/projects.locations.glossaries.glossaryEntries)

| Methods ||
|---|---|
| `https://docs.cloud.google.com/translate/docs/reference/rest/v3/projects.locations.glossaries.glossaryEntries/create` | `POST /v3/{parent=projects/*/locations/*/glossaries/*}/glossaryEntries` Creates a glossary entry. |
| `https://docs.cloud.google.com/translate/docs/reference/rest/v3/projects.locations.glossaries.glossaryEntries/delete` | `DELETE /v3/{name=projects/*/locations/*/glossaries/*/glossaryEntries/*}` Deletes a single entry from the glossary |
| `https://docs.cloud.google.com/translate/docs/reference/rest/v3/projects.locations.glossaries.glossaryEntries/get` | `GET /v3/{name=projects/*/locations/*/glossaries/*/glossaryEntries/*}` Gets a single glossary entry by the given id. |
| `https://docs.cloud.google.com/translate/docs/reference/rest/v3/projects.locations.glossaries.glossaryEntries/list` | `GET /v3/{parent=projects/*/locations/*/glossaries/*}/glossaryEntries` List the entries for the glossary. |
| `https://docs.cloud.google.com/translate/docs/reference/rest/v3/projects.locations.glossaries.glossaryEntries/patch` | `PATCH /v3/{glossaryEntry.name=projects/*/locations/*/glossaries/*/glossaryEntries/*}` Updates a glossary entry. |

## REST Resource: [v3.projects.locations.models](https://docs.cloud.google.com/translate/docs/reference/rest/v3/projects.locations.models)

| Methods ||
|---|---|
| `https://docs.cloud.google.com/translate/docs/reference/rest/v3/projects.locations.models/create` | `POST /v3/{parent=projects/*/locations/*}/models` Creates a Model. |
| `https://docs.cloud.google.com/translate/docs/reference/rest/v3/projects.locations.models/delete` | `DELETE /v3/{name=projects/*/locations/*/models/*}` Deletes a model. |
| `https://docs.cloud.google.com/translate/docs/reference/rest/v3/projects.locations.models/get` | `GET /v3/{name=projects/*/locations/*/models/*}` Gets a model. |
| `https://docs.cloud.google.com/translate/docs/reference/rest/v3/projects.locations.models/list` | `GET /v3/{parent=projects/*/locations/*}/models` Lists models. |

## REST Resource: [v3.projects.locations.operations](https://docs.cloud.google.com/translate/docs/reference/rest/v3/projects.locations.operations)

| Methods ||
|---|---|
| `https://docs.cloud.google.com/translate/docs/reference/rest/v3/projects.locations.operations/cancel` | `POST /v3/{name=projects/*/locations/*/operations/*}:cancel` Starts asynchronous cancellation on a long-running operation. |
| `https://docs.cloud.google.com/translate/docs/reference/rest/v3/projects.locations.operations/delete` | `DELETE /v3/{name=projects/*/locations/*/operations/*}` Deletes a long-running operation. |
| `https://docs.cloud.google.com/translate/docs/reference/rest/v3/projects.locations.operations/get` | `GET /v3/{name=projects/*/locations/*/operations/*}` Gets the latest state of a long-running operation. |
| `https://docs.cloud.google.com/translate/docs/reference/rest/v3/projects.locations.operations/list` | `GET /v3/{name=projects/*/locations/*}/operations` Lists operations that match the specified filter in the request. |
| `https://docs.cloud.google.com/translate/docs/reference/rest/v3/projects.locations.operations/wait` | `POST /v3/{name=projects/*/locations/*/operations/*}:wait` Waits until the specified long-running operation is done or reaches at most a specified timeout, returning the latest state. |