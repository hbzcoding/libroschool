<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreSchoolRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user() && $this->user()->isAdmin();
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'code' => ['nullable', 'string', 'max:50', 'unique:schools,code'],
            'name' => ['required', 'string', 'max:255'],
            'city' => ['nullable', 'string', 'max:255'],
            'province' => ['nullable', 'string', 'max:10'],
            'region' => ['nullable', 'string', 'max:100'],
            'country' => ['nullable', 'string', 'max:100'],
            'school_type' => ['nullable', 'string', 'max:100'],
        ];
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'name.required' => 'Il nome della scuola è obbligatorio.',
            'name.max' => 'Il nome non può superare i 255 caratteri.',
            'code.unique' => 'Questo codice scuola è già stato utilizzato.',
            'city.max' => 'La città non può superare i 255 caratteri.',
            'province.max' => 'La provincia non può superare i 10 caratteri.',
            'region.max' => 'La regione non può superare i 100 caratteri.',
            'country.max' => 'Il paese non può superare i 100 caratteri.',
            'school_type.max' => 'Il tipo di scuola non può superare i 100 caratteri.',
        ];
    }
}