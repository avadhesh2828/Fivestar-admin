<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>User List</title>

    <link href="{{ asset('css/app.css') }}" rel="stylesheet" type="text/css" />
    <style>
     table, th, td {
  border: 1px solid black;
}
table {
  width: 100%;
}

th {
  height: 50px;
}
tr.page-break
    {
        page-break-after: always;
        page-break-inside: avoid;
    }
    </style>
</head>

<body>
    <div class="container mt-5">
        <h2 class="text-center mb-3">User List</h2>
        <table class="table table-bordered mb-5">
            <thead>
                <tr class="table-danger">
                    <th scope="col">#</th>
                    <th scope="col">Name</th>
                    <th scope="col">Email</th>
                    <th scope="col">Phone</th>
                </tr>
            </thead>
            <tbody>
                @php ($i=1)
            @foreach($users ?? '' as $data)
                <tr class='page-break'>
                    <th scope="row">{{ $loop->index + 1 }}</th>
                    <td>{{ $data->first_name }} {{ $data->last_name }}</td>
                    <td>{{ $data->email }}</td>
                    <td>{{ $data->phone_number }}</td>
                </tr>


@php ($i++)
                @endforeach
            </tbody>
        </table>

    </div>

    <script src="{{ asset('js/app.js') }}" type="text/js"></script>
</body>

</html>
