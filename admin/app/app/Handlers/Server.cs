
using System.Net.Http;
using System.Threading.Tasks;

namespace app.Handlers
{
    class Server
    {
        // Removes a / in the end of thee URI (if present)
        public static string FilterURI(string uri)
        {
            if (uri[^1..] == "/")
            { 
                uri = uri.Remove(uri.Length - 1);
                return uri;
            } else
            {
                return uri;
            }
        }


        // true - the URI you've passed belongs to a zcafe instance
        // false - it doesn't
        public static async Task<bool> Check(string uri)
        {
            using (var http = new HttpClient())
            {
                uri = FilterURI(uri);
                var response = await http.GetAsync(uri + "/iluvcoffee");
                if (((int)response.StatusCode) == 418)
                {
                    return true;
                }
                else
                {
                    return false;
                }
            }

        }
    }
}
