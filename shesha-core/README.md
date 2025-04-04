shesha-core
========================


[![docs](https://badgen.net/badge/docs/Shesha/latest?version=latest)](https://docs.shesha.io/docs/get-started/Introduction)

## License

Shesha and the various shesha community components and services are available under the [GPL-3.0 license](https://opensource.org/licenses/GPL-3.0). Shesha also includes external libraries that are available under a variety of licenses. See [LICENSE](https://github.com/shesha-io/shesha-framework/blob/main/shesha-reactjs/LICENCE.md) for the full license text

## Running locally from CLI:

*The working directory is shesha-core*  
shesha-core  
 |-- src  
 |-- nupkg  
 |-- .nuget  
 |-- test  
 |-- ...

### Install / Restore dependencies

> dotnet restore

### Build

> dotnet build 

### Run

> dotnet run --project src/Shesha.Web.Host --urls "http://localhost:21021;https://localhost:44362"

> [!NOTE]
> If you have do not have local certificate for SSL you will need to install the default development certificate and trust via:
>> dotnet dev-certs https --trust
