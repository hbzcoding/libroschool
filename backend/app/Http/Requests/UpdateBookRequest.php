<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateBookRequest extends FormRequest
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
            'school_id' => ['sometimes', 'required', 'exists:schools,id'],
            'title' => ['sometimes', 'required', 'string', 'max:255'],
            'isbn' => ['nullable', 'string', 'max:20'],
            'subject' => ['nullable', 'string', 'max:100'],
            'grade' => ['nullable', 'string', 'max:20'],
            'track' => ['nullable', 'string', 'max:100'],
            'publisher' => ['nullable', 'string', 'max:100'],
            'author' => ['nullable', 'string', 'max:100'],
            'condition' => ['sometimes', 'required', 'string', 'in:new,very_good,good,acceptable'],
            'price' => ['sometimes', 'required', 'numeric', 'min:0', 'max:999999.99'],
            'description' => ['nullable', 'string'],
            'status' => ['nullable', 'string', 'in:available,reserved,sold,hidden'],
        ];
    }
}
