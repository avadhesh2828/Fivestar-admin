<?php

namespace App\Exports;

use App\Models\User;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\Exportable;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\FromCollection;

class UsersExport implements FromQuery, WithMapping, WithHeadings, ShouldAutoSize, FromCollection
{
    use Exportable;
    /**
    * @return \Illuminate\Support\query
    */
    public function query()
    {
        $list = User::all();
        return $list;
    }

    /**
    * @var User $user
    */
    public function map($user): array
    {

        return [
            $user->first_name . " " . $user->last_name,
            $user->email,
            $user->phone_number,
            $user->created_date,
        ];
    }

    private $headers = [
        'Content-Type' => 'text/csv',
    ];

    public function headings(): array
    {
        return [
            'Name',
            'Email',
            'Phone number',
            'Date',
        ];
    }

    public function collection()
    {
        return User::all();
    }
}
