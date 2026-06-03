FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS base
WORKDIR /app
EXPOSE 80
EXPOSE 443

FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src
COPY ["PatenteApp.Api/PatenteApp.Api.csproj", "PatenteApp.Api/"]
COPY ["PatenteApp.Domain/PatenteApp.Domain.csproj", "PatenteApp.Domain/"]
COPY ["PatenteApp.Application/PatenteApp.Application.csproj", "PatenteApp.Application/"]
COPY ["PatenteApp.Infrastructure/PatenteApp.Infrastructure.csproj", "PatenteApp.Infrastructure/"]
RUN dotnet restore "PatenteApp.Api/PatenteApp.Api.csproj"
COPY . .
RUN dotnet publish "PatenteApp.Api/PatenteApp.Api.csproj" -c Release -o /app/publish --no-restore

FROM base AS final
WORKDIR /app
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "PatenteApp.Api.dll"]
