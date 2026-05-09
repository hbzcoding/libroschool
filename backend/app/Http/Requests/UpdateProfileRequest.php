<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateProfileRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => ['sometimes', 'string', 'max:255'],
            'school_id' => ['sometimes', 'nullable', 'integer', 'exists:schools,id'],
            'grade' => ['sometimes', 'nullable', 'string', 'max:50'],
            'track' => ['sometimes', 'nullable', 'string', 'max:100'],
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
            'name.max' => 'Il nome non può superare i 255 caratteri.',
            'school_id.exists' => 'La scuola selezionata non esiste.',
            'grade.max' => 'L\'anno non può superare i 50 caratteri.',
            'track.max' => 'L\'indirizzo non può superare i 100 caratteri.',
        ];
    }
}