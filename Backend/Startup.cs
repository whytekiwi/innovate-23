using System.Text.Json;
using Innovate.Data;
using Microsoft.Azure.Functions.Extensions.DependencyInjection;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Newtonsoft.Json.Serialization;

[assembly: FunctionsStartup(typeof(Innovate.Startup))]

namespace Innovate
{
    public class Startup : FunctionsStartup
    {
        public override void Configure(IFunctionsHostBuilder builder)
        {
            builder.Services.AddHttpClient();

            builder.Services.AddOptions<AzureTableStorageOptions>()
                .Configure<IConfiguration>((settings, configuration) =>
                {
                    configuration.GetSection("AzureTableStorageOptions").Bind(settings);
                });

            builder.Services.AddMvcCore().AddNewtonsoftJson(options =>
                options.SerializerSettings.ContractResolver = new CamelCasePropertyNamesContractResolver()
            );


            builder.Services.AddSingleton<AttendeeDataTables>();
        }
    }
}