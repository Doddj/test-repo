import fetch from "node-fetch";

type ConfluencePage = {
  id: string;
  version: number;
  title: string;
  body: string;
};

type ConfluenceSearchResponse = {
  results: {
    id: string;
    type: string;
    status: string;
    title: string;
    version: { number: number };
    body: {
      view: {
        value: string;
      };
    };
  }[];
};

class Confluence {
  private endpoint;
  private autodocKey;

  constructor(endpoint: string, autodocKey: string) {
    this.endpoint = endpoint;
    this.autodocKey = autodocKey;
  }

  private getApiKey(): string {
    const key = process.env.CONFLUENCE_API_KEY;
    if (!key)
      throw Error(
        "Error authorizing Confluence, no API key found. Is env variable CONFLUENCE_API_KEY set?"
      );
    return key;
  }

  private parseSearchResponse(
    response: ConfluenceSearchResponse
  ): ConfluencePage[] {
    return response.results.map((result) => ({
      id: result.id,
      version: result.version.number,
      title: result.title,
      body: result.body.view.value,
    }));
  }

  async getAutodocPages(): Promise<ConfluencePage[]> {
    const response: ConfluenceSearchResponse = await fetch(
      `${this.endpoint}/wiki/rest/api/content/search?expand=body.view,version.number&cql=(space.key=ED) AND (text~\"${this.autodocKey}\")`,
      {
        headers: {
          Authorization: `Basic ${this.getApiKey()}`,
        },
      }
    ).then((res) => res.json());
    return this.parseSearchResponse(response);
  }
}

const c = new Confluence("https://autodocument.atlassian.net", "-autodoc-");
c.getAutodocPages().then((pages) => console.log(pages));
