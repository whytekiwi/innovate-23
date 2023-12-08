using Microsoft.AspNetCore.Http;
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Extensions.Http;
using Microsoft.Azure.WebJobs.Extensions.SignalRService;

namespace Innovate
{
    public static class SignalRNegotiateFunction
    {
        [FunctionName("negotiate")]
        public static SignalRConnectionInfo Negotiate(
            [HttpTrigger(AuthorizationLevel.Anonymous)]
            HttpRequest req,
            [SignalRConnectionInfo(HubName = "serverless")]
            SignalRConnectionInfo connectionInfo)
        {
            return connectionInfo;
        }
    }
}